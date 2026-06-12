import cv2
import numpy as np
import torch
from facenet_pytorch import MTCNN
from pathlib import Path

device   = torch.device("cuda" if torch.cuda.is_available() else "cpu")
detector = MTCNN(min_face_size=40, keep_all=True, device=device, post_process=False)
def extract_faces_from_video(video_path: str,
                              output_dir: str,
                              label: int,
                              frame_skip: int = 5,
                              target_size: tuple = (224, 224),
                              max_frames: int = 20) -> int:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[HATA] Açılamadı: {video_path}")
        return 0
    label_str  = "fake" if label == 1 else "real"
    video_name = Path(video_path).stem
    save_dir   = Path(output_dir) / label_str / video_name
    save_dir.mkdir(parents=True, exist_ok=True)
    frame_idx = 0
    saved     = 0
    while saved < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_skip == 0:
            rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            boxes, _ = detector.detect(rgb)
            if boxes is not None and len(boxes) > 0:
                # En büyük yüzü al
                areas = [(b[2]-b[0]) * (b[3]-b[1]) for b in boxes]
                b     = boxes[int(np.argmax(areas))]
                x1, y1, x2, y2 = [int(v) for v in b]

                pad = int(max(x2 - x1, y2 - y1) * 0.15)
                x1  = max(0, x1 - pad)
                y1  = max(0, y1 - pad)
                x2  = min(rgb.shape[1], x2 + pad)
                y2  = min(rgb.shape[0], y2 + pad)
                cropped = rgb[y1:y2, x1:x2]
                if cropped.size == 0:
                    frame_idx += 1
                    continue
                resized   = cv2.resize(cropped, target_size)
                # uint8 olarak kaydet (float32'ye gore 4x daha az yer kaplar)
                save_path = save_dir / f"frame_{saved:04d}.npy"
                np.save(str(save_path), resized)
                saved += 1

        frame_idx += 1

    cap.release()
    return saved
def batch_preprocess(splits_path: str, output_dir: str):
    import json
    from tqdm import tqdm

    with open(splits_path) as f:
        splits = json.load(f)

    for split_name, items in splits.items():
        print(f"\n--- {split_name.upper()} ({len(items)} video) ---")
        for video_path, label in tqdm(items):
            extract_faces_from_video(
                video_path=video_path,
                output_dir=f"{output_dir}/{split_name}",
                label=label
            )


if __name__ == "__main__":
    batch_preprocess("data/splits.json", "data/processed")
