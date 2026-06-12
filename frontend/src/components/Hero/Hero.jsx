import React from 'react';
import './Hero.css';

const STATS = [
  { value: '0.8783', label: 'Test AUC Skoru',   color: 'stat--green' },
  { value: '%93',    label: 'Gerçek Tespit',     color: 'stat--green' },
  { value: '2,743',  label: 'Eğitim Videosu',   color: 'stat--blue'  },
  { value: '20',     label: 'Analiz Edilen Kare',color: 'stat--purple'},
];

export default function Hero({ onScrollToAnalyze }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-glow hero-glow--left" />
        <div className="hero-glow hero-glow--right" />
      </div>

      <div className="hero-inner">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          EfficientNet-B0 + LSTM Hibrit Model
        </div>

        <h1 className="hero-title">
          Sahte Videoları<br />
          <span className="hero-title-accent">Yapay Zeka ile</span> Tespit Et
        </h1>

        <p className="hero-desc">
          DeepFake teknolojisi her geçen gün daha gerçekçi hale geliyor.
          Bu sistem, CNN ve LSTM mimarilerini birleştirerek hem görsel hem
          zamansal hataları analiz eder ve sahte videoları saniyeler içinde tespit eder.
        </p>

        <div className="hero-actions">
          <button className="hero-btn-primary" onClick={onScrollToAnalyze}>
            Hemen Analiz Et
            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="hero-btn-secondary" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
            Daha Fazla Bilgi
          </button>
        </div>

        <div className="hero-stats">
          {STATS.map((s) => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
