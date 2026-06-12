import os
import sys
import csv
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch.optim import Adam
from torch.optim.lr_scheduler import ReduceLROnPlateau
from sklearn.metrics import roc_auc_score
from tqdm import tqdm
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from model import DeepFakeModel
from dataset import DeepfakeDataset

# --- Hiperparametreler ---
BATCH_SIZE    = 4      # RTX 3050 4GB VRAM icin
EPOCHS        = 30
LEARNING_RATE = 1e-4
SEQ_LEN       = 20
PATIENCE      = 7

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Kullanilan cihaz: {device}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")

# Mixed precision — 4GB VRAM'da bellek tasarrufu saglar
scaler = torch.cuda.amp.GradScaler(enabled=torch.cuda.is_available())

train_ds = DeepfakeDataset("data/processed/train", sequence_length=SEQ_LEN)
val_ds   = DeepfakeDataset("data/processed/val",   sequence_length=SEQ_LEN)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0, pin_memory=True)
val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=True)

print(f"Egitim: {len(train_ds)} ornek | Dogrulama: {len(val_ds)} ornek")

model = DeepFakeModel(sequence_length=SEQ_LEN).to(device)

# Sinif dengesizligini duzelt: 461 real vs 4505 fake -> pos_weight = 4505/461 ~ 9.8
n_real = sum(1 for _, lbl in train_ds.samples if lbl == 0)
n_fake = sum(1 for _, lbl in train_ds.samples if lbl == 1)
pos_weight = torch.tensor([n_real / n_fake], device=device)
print(f"Sinif dagilimi — real: {n_real}, fake: {n_fake}, pos_weight: {pos_weight.item():.2f}")

criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
optimizer = Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LEARNING_RATE)
scheduler = ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=3, min_lr=1e-7)

os.makedirs("checkpoints", exist_ok=True)
os.makedirs("logs", exist_ok=True)

best_auc      = 0.0
patience_cnt  = 0
log_rows      = []

for epoch in range(1, EPOCHS + 1):
    # --- Egitim ---
    model.train()
    train_loss, correct, total = 0.0, 0, 0
    for X, y in tqdm(train_loader, desc=f"Epoch {epoch:02d} Train", leave=False):
        X, y = X.to(device), y.to(device)
        optimizer.zero_grad()
        with torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
            preds = model(X)
            loss  = criterion(preds, y)
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        train_loss += loss.item() * len(y)
        correct    += ((torch.sigmoid(preds) > 0.5) == y.bool()).sum().item()
        total      += len(y)

    train_loss /= total
    train_acc   = correct / total

    # --- Dogrulama ---
    model.eval()
    val_loss, all_preds, all_labels = 0.0, [], []
    with torch.no_grad():
        for X, y in tqdm(val_loader, desc=f"Epoch {epoch:02d} Val  ", leave=False):
            X, y = X.to(device), y.to(device)
            preds = model(X)
            val_loss += criterion(preds, y).item() * len(y)
            all_preds.extend(torch.sigmoid(preds).cpu().numpy())
            all_labels.extend(y.cpu().numpy())

    val_loss /= len(val_ds)
    val_acc   = ((np.array(all_preds) > 0.5) == np.array(all_labels)).mean()
    val_auc   = roc_auc_score(all_labels, all_preds) if len(set(all_labels)) > 1 else 0.0

    scheduler.step(val_auc)

    print(f"Epoch {epoch:02d}/{EPOCHS} | "
          f"train_loss={train_loss:.4f} acc={train_acc:.4f} | "
          f"val_loss={val_loss:.4f} acc={val_acc:.4f} auc={val_auc:.4f}")

    log_rows.append([epoch, train_loss, train_acc, val_loss, val_acc, val_auc])

    if val_auc > best_auc:
        best_auc = val_auc
        patience_cnt = 0
        torch.save(model.state_dict(), "checkpoints/best_model.pt")
        print(f"  -> En iyi model kaydedildi (AUC={best_auc:.4f})")
    else:
        patience_cnt += 1
        if patience_cnt >= PATIENCE:
            print(f"Early stopping (patience={PATIENCE})")
            break

with open("logs/training_log.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["epoch", "train_loss", "train_acc", "val_loss", "val_acc", "val_auc"])
    w.writerows(log_rows)

print(f"\nEgitim tamamlandi. En iyi AUC: {best_auc:.4f}")
print("Model: checkpoints/best_model.pt")
