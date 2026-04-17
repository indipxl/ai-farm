import { useState } from "react";
import { useBatches } from "../useBatches";

const MAP_BLOCKS = [
  { id: "A1", label: "A1", crop: "", status: "empty", name: "Chilli" }, { id: "A2", label: "A2", crop: "", status: "empty", name: "" },
  { id: "A3", label: "A3", crop: "", status: "empty", name: "" }, { id: "A4", label: "A4", crop: "", status: "empty", name: "" },
  { id: "A5", label: "A5", crop: "", status: "empty", name: "" }, { id: "A6", label: "A6", crop: "", status: "empty", name: "" },
  { id: "B1", label: "B1", crop: "", status: "empty", name: "" }, { id: "B2", label: "B2", crop: "", status: "empty", name: "" },
  { id: "B3", label: "B3", crop: "", status: "empty", name: "" }, { id: "B4", label: "B4", crop: "", status: "empty", name: "" },
  { id: "B5", label: "B5", crop: "", status: "empty", name: "" }, { id: "B6", label: "B6", crop: "", status: "empty", name: "" },
  { id: "C1", label: "C1", crop: "", status: "empty", name: "" }, { id: "C2", label: "C2", crop: "", status: "empty", name: "" },
  { id: "C3", label: "C3", crop: "", status: "empty", name: "" }, { id: "C4", label: "C4", crop: "", status: "empty", name: "" },
  { id: "C5", label: "C5", crop: "", status: "empty", name: "" }, { id: "C6", label: "C6", crop: "", status: "empty", name: "" },
  { id: "D1", label: "D1", crop: "🍅", status: "healthy", name: "" }, { id: "D2", label: "D2", crop: "", status: "empty", name: "" },
  { id: "D3", label: "D3", crop: "", status: "empty", name: "" }, { id: "D4", label: "D4", crop: "", status: "empty", name: "" },
  { id: "D5", label: "D5", crop: "", status: "empty", name: "" }, { id: "D6", label: "D6", crop: "", status: "empty", name: "" },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function DiseaseMapPage() {
  const { batches, loading } = useBatches();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState(null);

  const handleScanFarm = async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/disease/map-data`);
      const data = await res.json();
      setScanData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };
  const blockCls = { healthy: "fs-map-block--healthy", warning: "fs-map-block--warning", danger: "fs-map-block--danger", empty: "fs-map-block--empty" };

  const getBatchAt = (locId) => {
    return (batches || []).find(b => b.location && (b.location.toUpperCase() === locId.toUpperCase() || b.location.toUpperCase() === `BLOCK ${locId.toUpperCase()}`));
  };

  const statusLabel = { healthy: "Healthy", warning: "Warning", danger: "Danger" };
  const pillCls = { healthy: "fs-pill--healthy", warning: "fs-pill--warning", danger: "fs-pill--danger" };

  return (
    <>
      <div className="fs-page-header">
        <div>
          <div className="fs-page-eyebrow">Pest &amp; Disease Spread Tracker</div>
          <h1 className="fs-page-title">Disease <em>Movement</em> Map</h1>
          <p className="fs-page-sub">Track spread vectors across all blocks · Use timeline to review historical movement</p>
        </div>
      </div>

      <div className="fs-stat-strip">
        <div className="fs-stat-card fs-stat-card--red"><div className="fs-stat-card__label">Active Threats</div><div className="fs-stat-card__val fs-stat-card__val--danger">{scanData ? (scanData.active_threats ? 'Yes' : 'No') : '--'}</div><div className="fs-stat-card__meta">Farm level danger</div><span className="fs-stat-tag fs-stat-tag--danger">Global</span></div>
        <div className="fs-stat-card fs-stat-card--amber"><div className="fs-stat-card__label">Blocks at Risk</div><div className="fs-stat-card__val fs-stat-card__val--warn">{scanData ? scanData.at_risk_blocks?.length || 0 : '--'}</div><div className="fs-stat-card__meta">Within spread radius</div><span className="fs-stat-tag fs-stat-tag--warn">Monitor</span></div>
        <div className="fs-stat-card fs-stat-card--gold"><div className="fs-stat-card__label">Total Logs</div><div className="fs-stat-card__val">{scanData ? scanData.threat_log?.length || 0 : '--'}</div><div className="fs-stat-card__meta">AI observations</div></div>
        <div className="fs-stat-card fs-stat-card--green"><div className="fs-stat-card__label">Preventative Actions</div><div className="fs-stat-card__val">{scanData ? scanData.preventative_actions?.length || 0 : '--'}</div><div className="fs-stat-card__meta">Actionable tips</div></div>
      </div>

      <div className="fs-grid-2" style={{ alignItems: "start" }}>
        <div>
          <div className="fs-section-row">
            <div />
            <button className="fs-btn fs-btn--outline fs-btn--sm" onClick={handleScanFarm} disabled={isScanning}>
              {isScanning ? 'Scanning...' : '🧠 Scan Farm (AI)'}
            </button>
          </div>

          {/* Farm block map */}
          <div className="fs-card" style={{ marginBottom: 18 }}>
            <div className="fs-card__header">
              <div>
                <div className="fs-card__title">Farm Batch Map</div>
                <div className="fs-card__sub">Hover blocks for detail · Pulsing = active threat</div>
              </div>
            </div>
            <div className="fs-farm-map">
              <div className="fs-map-grid">
                {MAP_BLOCKS.map(blk => {
                  const liveBatch = getBatchAt(blk.id);
                  const status = liveBatch ? liveBatch.status : "empty";
                  const emoji = liveBatch ? (liveBatch.crop.toLowerCase().includes('chilli') ? '🌶️' : '🌿') : "";

                  return (
                    <div
                      key={blk.id}
                      className={`fs-map-block ${blockCls[status]} ${liveBatch ? 'fs-map-block--active' : ''}`}
                      title={liveBatch ? `${blk.id}: ${liveBatch.crop}` : `${blk.id}: Empty`}
                      onClick={() => liveBatch && setSelectedBatch(liveBatch)}
                      style={{ cursor: liveBatch ? 'pointer' : 'default' }}
                    >
                      <div className="fs-map-block__label">{blk.id}</div>
                      {emoji && <div className="fs-map-block__crop">{emoji}</div>}
                      <div className="fs-map-block__status">{status !== "empty" ? status : "–"}</div>
                    </div>
                  );
                })}
              </div>
              <div className="fs-map-legend">
                <div className="fs-map-legend__item"><div className="fs-map-legend__dot" style={{ background: "var(--red)" }} />Danger</div>
                <div className="fs-map-legend__item"><div className="fs-map-legend__dot" style={{ background: "var(--amber)" }} />Warning</div>
                <div className="fs-map-legend__item"><div className="fs-map-legend__dot" style={{ background: "var(--green-lt)" }} />Healthy</div>
                <div className="fs-map-legend__item"><div className="fs-map-legend__dot" style={{ background: "var(--cream3)" }} />Unplanted</div>
              </div>
            </div>
          </div>

          {/* Spread prediction */}
          <div className="fs-card">
            <div className="fs-card__header">
              <div>
                <div className="fs-card__title">Spread Prediction</div>
                <div className="fs-card__sub">AI risk forecast — real-time</div>
              </div>
            </div>
            <div className="fs-card__body">
              {scanData ? (
                <>
                  <div className="fs-suggestion">
                    <div className="fs-suggestion__label">AI Spread Forecast</div>
                    {scanData.spread_prediction}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(scanData.at_risk_blocks || []).map(r => (
                      <div key={r} style={{ background: "var(--amber)18", border: `1px solid var(--amber)44`, borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1rem" }}>{r}</div>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", color: "var(--amber)" }}>At Risk</div>
                      </div>
                    ))}
                  </div>
                  {(scanData.preventative_actions && scanData.preventative_actions.length > 0) && (
                    <div style={{ marginTop: 16 }}>
                      <div className="fs-section-label" style={{ marginBottom: 8, fontSize: '0.8rem' }}>Preventative Actions:</div>
                      <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        {scanData.preventative_actions.map((act, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                  Click <strong>Scan Farm</strong> to generate AI prediction.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Threat log */}
        <div>
          <div className="fs-section-row" style={{ marginTop: 20 }}>
            <div className="fs-section-label">Active Threat Log</div>
          </div>
          {scanData ? (
            scanData.threat_log && scanData.threat_log.length > 0 ? (
              scanData.threat_log.map((t, i) => (
                <div key={i} className={`fs-threat-entry ${scanData.active_threats ? 'fs-threat-entry--danger' : ''}`}>
                  <span className="fs-threat-entry__icon">{scanData.active_threats ? '🔴' : '🟡'}</span>
                  <div>
                    <div className="fs-threat-entry__title">AI Observation</div>
                    <div className="fs-threat-entry__desc">{t}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 12, color: 'var(--text-dim)', textAlign: 'center' }}>No active threats detected.</div>
            )
          ) : (
            <div style={{ padding: 12, color: 'var(--text-dim)', textAlign: 'center' }}>Waiting for scan...</div>
          )}
        </div>
      </div>
      {selectedBatch && (
        <div className="fs-modal-overlay" onClick={() => setSelectedBatch(null)} style={{ zIndex: 9999 }}>
          <div className="fs-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ padding: '24px' }}>
              <div className="fs-modal__eyebrow">Sensor Data</div>
              <div className="fs-batch-card__header">
                <div>
                  <div className="fs-batch-card__crop">{selectedBatch.crop}</div>
                  <div className="fs-batch-card__loc">📍 {selectedBatch.location}</div>
                  <div className="fs-batch-card__id">{selectedBatch.id}</div>
                </div>
                <span className={`fs-pill ${pillCls[selectedBatch.status]}`}>{statusLabel[selectedBatch.status]}</span>
              </div>
              <div className="fs-sensor-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="fs-sensor-mini">
                  <span className="fs-sensor-mini__icon">🌡️</span>
                  <span className="fs-sensor-mini__name">Temp</span>
                  <span className="fs-sensor-mini__val">{selectedBatch.sensor_data?.air?.temp ?? '--'}°C</span>
                </div>
                <div className="fs-sensor-mini">
                  <span className="fs-sensor-mini__icon">💧</span>
                  <span className="fs-sensor-mini__name">Moisture</span>
                  <span className="fs-sensor-mini__val">{selectedBatch.sensor_data?.soil?.moisture ?? '--'}%</span>
                </div>
                <div className="fs-sensor-mini">
                  <span className="fs-sensor-mini__icon">🌤️</span>
                  <span className="fs-sensor-mini__name">Humidity</span>
                  <span className="fs-sensor-mini__val">{selectedBatch.sensor_data?.air?.hum ?? '--'}%</span>
                </div>
                <div className="fs-sensor-mini">
                  <span className="fs-sensor-mini__icon">⚗️</span>
                  <span className="fs-sensor-mini__name">pH</span>
                  <span className="fs-sensor-mini__val">{selectedBatch.sensor_data?.soil?.ph ?? '--'}</span>
                </div>
              </div>

              {selectedBatch.sensor_data?.soil && (
                <div style={{ background: 'var(--cream2)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Soil Nutrients (NPK mg/kg)</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <div style={{ color: 'var(--red)' }}>N: {selectedBatch.sensor_data.soil.n}</div>
                    <div style={{ color: 'var(--gold)' }}>P: {selectedBatch.sensor_data.soil.p}</div>
                    <div style={{ color: 'var(--green)' }}>K: {selectedBatch.sensor_data.soil.k}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}