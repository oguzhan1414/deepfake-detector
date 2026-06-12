# Tam pipeline: split -> preprocess -> train -> evaluate
# Calistirma: .\run_pipeline.ps1

Set-Location $PSScriptRoot

Write-Host "1/4  Veri bolme..." -ForegroundColor Cyan
python src/data_split.py

Write-Host "2/4  On isleme (yuz cıkarma) — bu uzun surer..." -ForegroundColor Cyan
python src/preprocessing.py

Write-Host "3/4  Model egitimi..." -ForegroundColor Cyan
python src/train.py

Write-Host "4/4  Degerlendirme..." -ForegroundColor Cyan
python src/evaluate.py

Write-Host "`nPipeline tamamlandi!" -ForegroundColor Green
