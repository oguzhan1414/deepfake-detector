import os
import sys
import tempfile
import numpy as np
import cv2
import torch
import gradio as gr
from PIL import Image
from facenet_pytorch import MTCNN
import imageio_ffmpeg

sys.path.insert(0, "src")
from model import DeepFakeModel

MODEL_PATH = "checkpoints/best_model.pt"
SEQ_LEN    = 20

model         = None
face_detector = None
device        = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CSS = """
#baslik { text-align: center; margin-bottom: 10px; }
#baslik h1 { font-size: 2.2em; font-weight: 700; color: #e74c3c; }
#baslik p  { font-size: 1em; color: #888; }

#sonuc-kutu { border-radius: 12px; padding: 20px; background: #1a1a2e; }
#sonuc-kutu .sahte  { color: #e74c3c; font-size: 1.8em; font-weight: 700; }
#sonuc-kutu .gercek { color: #2ecc71; font-size: 1.8em; font-weight: 700; }

.yukle-btn { background: #e74c3c !important; color: white !important; font-size: 1.1em !important; }
.temizle-btn { background: #555 !important; color: white !important; }

footer { display: none !important; }
"""


def convert_h264(input_path: str) -> str:
    import subprocess
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    tmp.close()
    subprocess.run([
        ffmpeg_exe, "-y", "-i", input_path,
        "-vcodec", "libx264", "-acodec", "aac",
        "-movflags", "+faststart", tmp.name
    ], capture_output=True)
    return tmp.name


def load_model():
    global model, face_detector
    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model bulunamadi: {MODEL_PATH}")
        m = DeepFakeModel()
        m.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        m.to(device)
        m.eval()
        model = m
    if face_detector is None:
        face_detector = MTCNN(min_face_size=40, keep_all=True, device=device, post_process=False)


def analyze_video(video_path):
    if video_path is None:
        return None, None, "### Video yuklenmedi."

    load_model()
    converted = convert_h264(video_path)

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
                resized = cv2.resize(crop, (112, 112))
                faces_vis.append(resized)
                frames.append(cv2.resize(crop, (224, 224)).astype(np.float32) / 255.0)
        frame_idx += 1
    cap.release()

    if len(frames) < SEQ_LEN:
        return converted, None, f"### Hata\nYalnizca **{len(frames)}** yuz karesi bulundu. En az **{SEQ_LEN}** gerekli.\n\nVideoda yuz tespit edilemiyor olabilir."

    # Yuz karelerini 4x5 grid olarak birlestir
    while len(faces_vis) < 20:
        faces_vis.append(np.zeros((112, 112, 3), dtype=np.uint8))

    rows = []
    for i in range(0, 20, 5):
        row = np.hstack(faces_vis[i:i+5])
        rows.append(row)
    grid = np.vstack(rows)

    # Her kareye ince cerceve ekle
    for i in range(1, 5):
        grid[:, i*112-1:i*112+1] = [50, 50, 50]
    for i in range(1, 4):
        grid[i*112-1:i*112+1, :] = [50, 50, 50]

    preview = Image.fromarray(grid.astype(np.uint8))

    # Model tahmini
    seq    = np.stack(frames[:SEQ_LEN]).transpose(0, 3, 1, 2)
    tensor = torch.tensor(seq).unsqueeze(0).to(device)

    with torch.no_grad():
        prob = float(torch.sigmoid(model(tensor)).item())

    label      = "SAHTE (DeepFake)" if prob > 0.5 else "GERÇEK"
    confidence = prob if prob > 0.5 else 1 - prob
    renk       = "🔴" if prob > 0.5 else "🟢"

    # Guven cubugu
    bar_dolu  = int(confidence * 20)
    bar_bos   = 20 - bar_dolu
    guven_bar = "█" * bar_dolu + "░" * bar_bos

    result = f"""## {renk} {label}

---

| Metrik | Değer |
|--------|-------|
| **Karar** | {label} |
| **Güven Oranı** | %{confidence * 100:.1f} |
| **Ham Olasılık (Sahte)** | {prob:.4f} |
| **Analiz Edilen Kare** | {SEQ_LEN} |

**Güven:** `{guven_bar}` %{confidence*100:.0f}

---
*Eşik değeri: 0.50 — {SEQ_LEN} ardışık kare analiz edildi*"""

    return converted, preview, result


with gr.Blocks() as demo:

    with gr.Row(elem_id="baslik"):
        gr.HTML("""
        <div id="baslik">
            <h1>🎭 DeepFake Analiz Sistemi</h1>
            <p>CNN + LSTM hibrit modeli ile video doğrulama — EfficientNet-B0 + Temporal Analysis</p>
        </div>
        """)

    with gr.Row():
        with gr.Column(scale=1):
            video_input = gr.Video(label="📹 Video Yükle (.mp4, .avi, .mov)")
            with gr.Row():
                temizle = gr.Button("🗑️ Temizle", elem_classes="temizle-btn")
                analiz  = gr.Button("🔍 Analiz Et", variant="primary", elem_classes="yukle-btn")

            gr.Markdown("""
            **Nasıl kullanılır?**
            1. Analiz etmek istediğiniz videoyu yükleyin
            2. "Analiz Et" butonuna tıklayın
            3. Sonucu sağ tarafta görün

            > Model 20 ardışık kareyi inceleyerek karar verir.
            """)

        with gr.Column(scale=1):
            video_out  = gr.Video(label="📺 Yüklenen Video", height=220)
            kare_grid  = gr.Image(label="🔬 Analiz Edilen Yüz Kareleri (20 Kare)", height=250)
            sonuc_text = gr.Markdown(label="Analiz Sonucu", value="*Video yüklenip analiz edilince sonuç burada görünecek...*")

    analiz.click(fn=analyze_video, inputs=video_input, outputs=[video_out, kare_grid, sonuc_text])
    temizle.click(fn=lambda: (None, None, None, "*Video yüklenip analiz edilince sonuç burada görünecek...*"),
                  outputs=[video_input, video_out, kare_grid, sonuc_text])

    gr.Markdown("""
    ---
    **Model Bilgisi:** EfficientNet-B0 + LSTM | **Veri Seti:** Celeb-DF v2 | **Test AUC:** 0.8783
    """)

if __name__ == "__main__":
    demo.launch(share=False, server_port=7860,
                theme=gr.themes.Soft(primary_hue="red"), css=CSS)
