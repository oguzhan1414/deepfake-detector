import os
import json
import random
from pathlib import Path

REAL_DIR  = "data/raw/Celeb-real"
FAKE_DIR  = "data/raw/Celeb-synthesis"
YT_DIR    = "data/raw/YouTube-real"
TEST_LIST = "data/raw/List_of_testing_videos.txt"


def build_splits(val_ratio: float = 0.15, seed: int = 42):
    random.seed(seed)

    with open(TEST_LIST) as f:
        test_entries = [line.strip().split() for line in f if line.strip()]

    test_videos = set()
    test_samples = []
    for parts in test_entries:
        # txt dosyasinda: 1=gercek, 0=sahte  →  modelimiz icin tersine cevir
        raw_lbl, rel_path = int(parts[0]), parts[1]
        lbl = 0 if raw_lbl == 1 else 1
        full_path = os.path.join("data/raw", rel_path).replace("\\", "/")
        test_videos.add(rel_path)
        test_samples.append((full_path, lbl))

    def collect(directory, label):
        p = Path(directory)
        if not p.exists():
            print(f"[UYARI] Klasor bulunamadi: {directory}")
            return []
        return [(str(f).replace("\\", "/"), label)
                for f in p.glob("*.mp4")
                if not any(f.name in tv for tv in test_videos)]

    real_all = collect(REAL_DIR, 0) + collect(YT_DIR, 0)
    fake_all = collect(FAKE_DIR, 1)

    random.shuffle(real_all)
    random.shuffle(fake_all)

    def split(lst):
        n = int(len(lst) * val_ratio)
        return lst[n:], lst[:n]

    real_tr, real_val = split(real_all)
    fake_tr, fake_val = split(fake_all)

    splits = {
        "train": real_tr + fake_tr,
        "val":   real_val + fake_val,
        "test":  test_samples,
    }

    os.makedirs("data", exist_ok=True)
    with open("data/splits.json", "w") as f:
        json.dump(splits, f, indent=2)

    print(f"Egitim  : {len(splits['train'])} video")
    print(f"Dogrulama: {len(splits['val'])} video")
    print(f"Test    : {len(splits['test'])} video")


if __name__ == "__main__":
    build_splits()
