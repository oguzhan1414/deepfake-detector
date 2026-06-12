# GOZCU kurulum scripti (PowerShell)
# Calistirma: .\setup.ps1

Write-Host "=== GOZCU Ortam Kurulumu ===" -ForegroundColor Cyan

# Conda ortami olustur
conda create -n gozcu python=3.10 -y
conda activate gozcu

# Kutuphaneleri yukle
pip install tensorflow==2.13.0
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt

Write-Host "`n=== Kurulum tamamlandi ===" -ForegroundColor Green
Write-Host "Simdi yapmaniz gerekenler:" -ForegroundColor Yellow
Write-Host "  1. kaggle.json dosyasini %USERPROFILE%\.kaggle\ klasorune kopyalayin"
Write-Host "  2. 'kaggle datasets download -d reubensuju/celeb-df-v2' calistirin"
Write-Host "  3. ZIP'i data/raw/ klasorune acin"
