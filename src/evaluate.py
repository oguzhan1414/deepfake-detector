import os
import sys
import numpy as np
import torch
import matplotlib.pyplot as plt
import seaborn as sns
from torch.utils.data import DataLoader
from sklearn.metrics import (classification_report, confusion_matrix,
                              roc_auc_score, roc_curve)

sys.path.insert(0, os.path.dirname(__file__))
from model import DeepFakeModel
from dataset import DeepfakeDataset


def evaluate_model(model_path: str = "checkpoints/best_model.pt",
                   test_data_dir: str = "data/processed/test"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = DeepFakeModel()
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()

    test_ds     = DeepfakeDataset(test_data_dir)
    test_loader = DataLoader(test_ds, batch_size=4, shuffle=False, num_workers=0)

    all_preds, all_labels = [], []
    with torch.no_grad():
        for X, y in test_loader:
            X = X.to(device)
            preds = torch.sigmoid(model(X)).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(y.numpy())

    all_preds  = np.array(all_preds)
    all_labels = np.array(all_labels)
    preds_bin  = (all_preds > 0.5).astype(int)

    print("\n===== SINIFLANDIRMA RAPORU =====")
    print(classification_report(all_labels, preds_bin, target_names=["Gercek", "Sahte"]))

    auc = roc_auc_score(all_labels, all_preds)
    print(f"AUC-ROC: {auc:.4f}")

    os.makedirs("results", exist_ok=True)

    cm = confusion_matrix(all_labels, preds_bin)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=["Gercek", "Sahte"],
                yticklabels=["Gercek", "Sahte"])
    plt.title("Karmasiklik Matrisi")
    plt.tight_layout()
    plt.savefig("results/confusion_matrix.png", dpi=150)

    fpr, tpr, _ = roc_curve(all_labels, all_preds)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, label=f"AUC = {auc:.4f}")
    plt.plot([0, 1], [0, 1], "k--")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Egrisi")
    plt.legend()
    plt.tight_layout()
    plt.savefig("results/roc_curve.png", dpi=150)

    print("Kaydedildi: results/confusion_matrix.png")
    print("Kaydedildi: results/roc_curve.png")


if __name__ == "__main__":
    evaluate_model()
