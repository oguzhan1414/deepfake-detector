import React, { useState, useRef, useCallback } from 'react';
import './UploadZone.css';

const ACCEPTED = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'];

export default function UploadZone({ onAnalyze, onReset, loading }) {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInput               = useRef();

  const accept = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && ACCEPTED.includes(f.type)) accept(f);
  }, []);

  const handleChange = (e) => accept(e.target.files[0]);

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = '';
    onReset();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="upload-card">
      <div className="card-header">
        <span className="card-icon">📹</span>
        <h2 className="card-title">Video Yükle</h2>
      </div>

      {!file ? (
        <div
          className={`dropzone${dragging ? ' dropzone--active' : ''}`}
          onClick={() => fileInput.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="dropzone-icon">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 32V16M24 16L18 22M24 16L30 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="6" y="6" width="36" height="36" rx="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
            </svg>
          </div>
          <p className="dropzone-text">Videoyu buraya sürükleyin</p>
          <p className="dropzone-hint">veya tıklayarak seçin</p>
          <p className="dropzone-formats">.mp4 · .avi · .mov</p>
          <input
            ref={fileInput}
            type="file"
            accept="video/mp4,video/avi,video/quicktime"
            className="file-input-hidden"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="preview-section">
          <video
            className="video-preview"
            src={preview}
            controls
            muted
          />
          <div className="file-info">
            <div className="file-info-row">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatSize(file.size)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="upload-actions">
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={loading}
        >
          Temizle
        </button>
        <button
          className="btn btn-primary"
          onClick={() => file && onAnalyze(file)}
          disabled={!file || loading}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner" />
              Analiz Ediliyor...
            </span>
          ) : (
            '🔍 Analiz Et'
          )}
        </button>
      </div>

      <div className="upload-info">
        <p>Model, videonuzdaki ilk <strong>20 yüz karesini</strong> analiz eder.</p>
      </div>
    </div>
  );
}
