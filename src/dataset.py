import numpy as np
from pathlib import Path
from torch.utils.data import Dataset


class DeepfakeDataset(Dataset):
    def __init__(self, data_dir: str, sequence_length: int = 20):
        self.seq_len = sequence_length
        self.samples = []

        for label_str, label in [("real", 0), ("fake", 1)]:
            label_dir = Path(data_dir) / label_str
            if not label_dir.exists():
                continue
            for video_dir in sorted(label_dir.iterdir()):
                frames = sorted(video_dir.glob("*.npy"))
                if len(frames) >= sequence_length:
                    self.samples.append((str(video_dir), label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        video_dir, label = self.samples[idx]
        frames = sorted(Path(video_dir).glob("*.npy"))[:self.seq_len]
        # (seq_len, H, W, C) -> (seq_len, C, H, W)
        seq = np.stack([np.load(str(f)) for f in frames])
        # uint8 -> float32 normalizasyon
        seq = seq.astype(np.float32) / 255.0
        seq = seq.transpose(0, 3, 1, 2)
        return seq, np.float32(label)
