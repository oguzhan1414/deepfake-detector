import torch
import torch.nn as nn
import timm
class DeepFakeModel(nn.Module):
    def __init__(self, sequence_length: int = 20, lstm_units: int = 256, dropout: float = 0.5):
        super().__init__()
        self.seq_len = sequence_length
        self.cnn = timm.create_model("efficientnet_b0", pretrained=True, num_classes=0)
        feature_dim = self.cnn.num_features  # 1280
        for param in self.cnn.parameters():
            param.requires_grad = False

        self.lstm = nn.LSTM(feature_dim, lstm_units, batch_first=True)
        self.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(lstm_units, 128),
            nn.ReLU(),
            nn.Dropout(dropout / 2),
            nn.Linear(128, 1),
        )
    def forward(self, x):
        B, T, C, H, W = x.shape
        x = x.view(B * T, C, H, W)
        features = self.cnn(x)
        features = features.view(B, T, -1)
        _, (hidden, _) = self.lstm(features)
        out = self.classifier(hidden[-1])
        return out.squeeze(1)
