import React, { useState } from 'react';
import './AnalyzePage.css';
import UploadZone from '../../components/UploadZone/UploadZone';
import ResultPanel from '../../components/ResultPanel/ResultPanel';

export default function AnalyzePage() {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleAnalyze = async (file) => {
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await fetch('/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analiz başarısız oldu.');
      }
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setResult(null); setError(null); };

  return (
    <div className="analyze-page">

      {/* ── Hero ── */}
      <section className="an-hero">
        <div className="an-hero-glow-l" />
        <div className="an-hero-glow-r" />
        <div className="an-hero-dots" />
        <div className="an-hero-inner">
          <span className="an-breadcrumb">Ana Sayfa &nbsp;/&nbsp; <strong>Analiz Et</strong></span>
          <div className="an-tag">
            <span className="an-tag-dot" />
            EfficientNet-B0 + LSTM Pipeline
          </div>
          <h1 className="an-title">Video Analizi</h1>
          <p className="an-sub">
            Videonuzu yükleyin — sistem 20 ardışık yüz karesini zamansal olarak
            analiz ederek sahte / gerçek kararı verir.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="an-body">

        <div className="an-grid">
          <UploadZone onAnalyze={handleAnalyze} onReset={handleReset} loading={loading} />
          <ResultPanel result={result} error={error} loading={loading} />
        </div>

        {/* ── Tips ── */}
        <div className="an-tips">
          <h3 className="an-tips-title">İpuçları</h3>
          <div className="an-tips-grid">
            {[
              { icon: '📹', head: 'Net Yüz Görüntüsü', body: 'Videoda net ve büyük bir yüz olması tespiti kolaylaştırır. Çok uzak veya bulanık yüzler tespit edilemeyebilir.' },
              { icon: '⏱️', head: 'Süre',              body: 'Model her 5. kareyi işler. En az 100 kare (~4 saniye, 25fps) içeren videolar için optimum sonuç alınır.' },
              { icon: '🎭', head: 'Tek Yüz',           body: 'Birden fazla yüz olduğunda model en büyük yüzü analiz eder. Tek kişilik videolar daha doğru sonuç verir.' },
              { icon: '💾', head: 'Dosya Boyutu',      body: '250 MB altındaki dosyalar önerilir. Büyük dosyalar analiz süresini uzatır.' },
            ].map(t => (
              <div key={t.head} className="an-tip-card">
                <div className="an-tip-icon-wrap">
                  <span className="an-tip-icon">{t.icon}</span>
                </div>
                <div>
                  <p className="an-tip-head">{t.head}</p>
                  <p className="an-tip-body">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
