# DeepFake Detector

Celeb-DF v2 veri seti üzerinde eğitilmiş **EfficientNet-B0 + LSTM** mimarisi kullanarak video tabanlı deepfake tespiti yapan bir web uygulaması.

---

## Model Performansı

| Metrik | Değer |
|--------|-------|
| Test AUC | 0.8783 |
| Gerçek Tespit (Recall) | %93 |
| Sahte Precision | %94 |
| Eğitim Videosu | 2.743 |
| Karar Eşiği | 0.40 |

---

## Nasıl Çalışır?

1. **Video Yükleme** — MP4, AVI veya MOV formatında video yüklenir
2. **MTCNN ile Yüz Tespiti** — Her 5. kare işlenir, en büyük yüz kırpılır ve 224×224'e boyutlandırılır
3. **EfficientNet-B0** — Her kareden 1280 boyutlu özellik vektörü çıkarılır
4. **LSTM Analizi** — 20 karelik dizi LSTM'e verilir; zamansal tutarsızlıklar modellenir
5. **Karar** — Sigmoid çıkışı ile \[0,1\] olasılık üretilir, 0.40 eşiği ile Gerçek/Sahte kararı verilir

---

## Mimari

```
bitirme_projesi/
├── backend/          # FastAPI uygulaması
│   ├── main.py
│   └── requirements.txt
├── frontend/         # React uygulaması
│   └── src/
├── src/              # Model eğitim kodları
│   ├── model.py
│   ├── train.py
│   ├── dataset.py
│   └── evaluate.py
└── checkpoints/      # Eğitilmiş model ağırlıkları
    └── best_model.pt
```

---

## Teknolojiler

**Backend:** Python 3.11 · FastAPI · PyTorch · EfficientNet-B0 · LSTM · MTCNN · OpenCV

**Frontend:** React 19 · React Router · Canvas API

---

## Kurulum

### Backend

```bash
# Proje kök dizininde
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r backend/requirements.txt

cd backend
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Uygulama `http://localhost:3000` adresinde açılır. Frontend, `/analyze` isteklerini `http://localhost:8000` adresindeki backend'e yönlendirir.

---

## Veri Seti

[Celeb-DF v2](https://github.com/yuezunli/celeb-deepfakeforensics) — 590 gerçek, 5.639 sahte video içeren yüksek kaliteli deepfake veri seti.

---

## Lisans

Bu proje bir lisans bitirme projesi kapsamında geliştirilmiştir.
