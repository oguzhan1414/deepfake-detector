import React, { useState } from 'react';
import './FaceGrid.css';

export default function FaceGrid({ imageB64 }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="facegrid">
      <div className="facegrid-header" onClick={() => setExpanded(p => !p)}>
        <span className="facegrid-title">🔬 Analiz Edilen Yüz Kareleri (20 Kare)</span>
        <span className={`facegrid-toggle ${expanded ? 'toggle--open' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="facegrid-body">
          <img
            src={`data:image/png;base64,${imageB64}`}
            alt="Yüz kareleri grid"
            className="facegrid-img"
          />
          <p className="facegrid-caption">4 satır × 5 sütun — her kare 112×112 px</p>
        </div>
      )}
    </div>
  );
}
