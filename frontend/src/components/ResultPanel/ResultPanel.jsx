import React from 'react';
import './ResultPanel.css';
import FaceGrid from '../FaceGrid/FaceGrid';

export default function ResultPanel({ result, error, loading }) {
  if (loading) {
    return (
      <div className="result-card result-card--loading">
        <div className="loading-animation">
          <div className="scan-circle" />
          <div className="scan-line" />
        </div>
        <p className="loading-text">Video analiz ediliyor...</p>
        <p className="loading-sub">Yüz kareleri tespit ediliyor ve sınıflandırılıyor</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-card result-card--error">
        <div className="result-icon">⚠️</div>
        <h3 className="result-error-title">Analiz Başarısız</h3>
        <p className="result-error-msg">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-card result-card--empty">
        <div className="empty-icon">🎭</div>
        <p className="empty-text">Analiz sonucu burada görünecek</p>
        <p className="empty-sub">Bir video yükleyip "Analiz Et" butonuna tıklayın</p>
      </div>
    );
  }

  const { label, is_fake, probability, confidence, frames_analyzed, face_grid_b64 } = result;
  const pct     = (confidence * 100).toFixed(1);
  const barFill = Math.round(confidence * 100);

  return (
    <div className={`result-card result-card--done ${is_fake ? 'result--fake' : 'result--real'}`}>

      <div className="verdict-banner">
        <div className={`verdict-indicator ${is_fake ? 'indicator--fake' : 'indicator--real'}`} />
        <div>
          <p className="verdict-sublabel">{is_fake ? 'Sahte İçerik Tespit Edildi' : 'Orijinal İçerik'}</p>
          <h2 className={`verdict-label ${is_fake ? 'text--fake' : 'text--real'}`}>
            {is_fake ? '🔴 SAHTE' : '🟢 GERÇEK'}
          </h2>
        </div>
      </div>

      <div className="confidence-section">
        <div className="confidence-header">
          <span className="confidence-title">Güven Oranı</span>
          <span className={`confidence-value ${is_fake ? 'text--fake' : 'text--real'}`}>%{pct}</span>
        </div>
        <div className="confidence-bar-bg">
          <div
            className={`confidence-bar-fill ${is_fake ? 'bar--fake' : 'bar--real'}`}
            style={{ width: `${barFill}%` }}
          />
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <span className="metric-label">Ham Olasılık</span>
          <span className="metric-value">{probability.toFixed(4)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Analiz Edilen</span>
          <span className="metric-value">{frames_analyzed} kare</span>
        </div>
        <div className="metric">
          <span className="metric-label">Eşik Değeri</span>
          <span className="metric-value">0.4000</span>
        </div>
        <div className="metric">
          <span className="metric-label">Karar</span>
          <span className={`metric-value ${is_fake ? 'text--fake' : 'text--real'}`}>{label}</span>
        </div>
      </div>

      {face_grid_b64 && (
        <FaceGrid imageB64={face_grid_b64} />
      )}

      <p className="result-disclaimer">
        Model 20 ardışık kareyi inceleyerek karar vermiştir. Yüksek güven ≠ kesin sonuç.
      </p>
    </div>
  );
}
