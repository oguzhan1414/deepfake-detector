import os
import sys
import io
import base64
import tempfile
import numpy as np
import cv2
import torch
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import imageio_ffmpeg
import subprocess

from model import DeepFakeModel

app = FastAPI(title="DeepFake Analiz API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).parent / "checkpoints" / "best_model.pt"
SEQ_LEN    = 20
device     = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model         = None
face_detector = None


def load_model():
    global model, face_detector
    if model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model bulunamadi: {MODEL_PATH}")
        from facenet_pytorch import MTCNN
        m = DeepFakeModel()
        m.load_state_dict(torch.load(str(MODEL_PATH), map_location=device))
        m.to(device)
        m.eval()
        model = m
    if face_detector is None:
        from facenet_pytorch import MTCNN
        face_detector = MTCNN(min_face_size=40, keep_all=True, device=device, post_process=False)


def convert_to_h264(input_path: str) -> str:
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    tmp.close()
    subprocess.run([
        ffmpeg_exe, "-y", "-i", input_path,
        "-vcodec", "libx264", "-acodec", "aac",
        "-movflags", "+faststart", tmp.name
    ], capture_output=True)
    return tmp.name


def extract_frames(video_path: str):
    cap       = cv2.VideoCapture(video_path)
    frames    = []
    faces_vis = []
    frame_idx = 0

    while len(frames) < SEQ_LEN:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % 5 == 0:
            rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            boxes, _ = face_detector.detect(rgb)
            if boxes is not None and len(boxes) > 0:
                areas        = [(b[2]-b[0])*(b[3]-b[1]) for b in boxes]
                b            = boxes[int(np.argmax(areas))]
                x1, y1, x2, y2 = [int(v) for v in b]
                pad          = int(max(x2-x1, y2-y1) * 0.15)
                x1, y1       = max(0, x1-pad), max(0, y1-pad)
                x2, y2       = min(rgb.shape[1], x2+pad), min(rgb.shape[0], y2+pad)
                crop         = rgb[y1:y2, x1:x2]
                if crop.size == 0:
                    frame_idx += 1
                    continue
                faces_vis.append(cv2.resize(crop, (112, 112)))
                frames.append(cv2.resize(crop, (224, 224)).astype(np.float32) / 255.0)
        frame_idx += 1

    cap.release()
    return frames, faces_vis


def build_face_grid(faces_vis: list) -> str:
    while len(faces_vis) < 20:
        faces_vis.append(np.zeros((112, 112, 3), dtype=np.uint8))

    rows = []
    for i in range(0, 20, 5):
        row = np.hstack(faces_vis[i:i+5])
        rows.append(row)
    grid = np.vstack(rows)

    for i in range(1, 5):
        grid[:, i*112-1:i*112+1] = [40, 40, 40]
    for i in range(1, 4):
        grid[i*112-1:i*112+1, :] = [40, 40, 40]

    img = Image.fromarray(grid.astype(np.uint8))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


class AnalysisResult(BaseModel):
    label: str
    is_fake: bool
    probability: float
    confidence: float
    frames_analyzed: int
    face_grid_b64: str


@app.post("/analyze", response_model=AnalysisResult)
async def analyze(video: UploadFile = File(...)):
    load_model()

    suffix = Path(video.filename).suffix or ".mp4"
    tmp_in = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    tmp_in.write(await video.read())
    tmp_in.close()

    try:
        frames, faces_vis = extract_frames(tmp_in.name)
    finally:
        os.unlink(tmp_in.name)

    if len(frames) < SEQ_LEN:
        raise HTTPException(
            status_code=422,
            detail=f"Yalnizca {len(frames)} yuz karesi bulundu. En az {SEQ_LEN} gerekli."
        )

    seq    = np.stack(frames[:SEQ_LEN]).transpose(0, 3, 1, 2)
    tensor = torch.tensor(seq).unsqueeze(0).to(device)

    with torch.no_grad():
        prob = float(torch.sigmoid(model(tensor)).item())

    is_fake    = prob > 0.40
    confidence = prob if is_fake else 1 - prob
    label      = "SAHTE" if is_fake else "GERÇEK"
    grid_b64   = build_face_grid(faces_vis)

    return AnalysisResult(
        label=label,
        is_fake=is_fake,
        probability=prob,
        confidence=confidence,
        frames_analyzed=SEQ_LEN,
        face_grid_b64=grid_b64,
    )


@app.get("/health")
def health():
    return {"status": "ok", "device": str(device)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
