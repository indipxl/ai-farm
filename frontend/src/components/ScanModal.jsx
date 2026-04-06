import { useState, useRef, useEffect } from 'react';

const PROC_STEPS = ['Extracting visual features...', 'Checking disease patterns...', 'Cross-referencing pest database...', 'Generating recommendations...', 'Finalising analysis...'];

const AI_RESULTS = {
    healthy: {
        icon: '✅',
        title: 'No Disease or Pest Detected',
        conf: 'Confidence: 95%',
        detail: 'No visible signs of disease or pest infestation.',
        sugs: ['Maintain current schedule', 'Next scan in 48h']
    },
    aphid: {
        icon: '🔎',
        title: 'Aphid Infestation — Early Stage',
        conf: 'Confidence: 82%',
        detail: 'Small colonies on leaf undersides.',
        sugs: ['Neem oil spray', 'Encourage predators']
    },
    blight: {
        icon: '⚠️',
        title: 'Early Blight Detected',
        conf: 'Confidence: 91%',
        detail: 'Lesions on lower leaves.',
        sugs: ['Copper fungicide 24h', 'Remove leaves']
    }
};

export default function ScanModal({ batch, onClose }) {
    const [phase, setPhase] = useState('upload');
    const [step, setStep] = useState(PROC_STEPS[0]);
    const [result, setResult] = useState(null);
    const fileRef = useRef();

    const startProcessing = () => {
        setPhase('processing');
        let i = 0;
        const iv = setInterval(() => {
            if (i < PROC_STEPS.length) {
                setStep(PROC_STEPS[i++]);
            } else {
                clearInterval(iv);
                const keys = Object.keys(AI_RESULTS);
                setResult(AI_RESULTS[keys[Math.floor(Math.random() * keys.length)]]);
                setPhase('result');
            }
        }, 850);
    };

    if (!batch) return null;

    return (
        <div className="fs-modal-overlay" onClick={onClose}>
            <div className="fs-modal" onClick={e => e.stopPropagation()}>
                <div className="fs-camera-view">
                    <span className="fs-camera-view__bg">📷</span>
                    <div className="fs-scan-frame-wrap">
                        <div className="fs-scan-frame" />
                    </div>
                </div>
                <div className="fs-modal__header">
                    <div className="fs-modal__eyebrow">AI Camera Vision</div>
                    <div className="fs-modal__title">
                        Scanning: <span style={{ color: 'var(--gold-dim)' }}>{batch.crop}</span>
                    </div>
                    <div className="fs-modal__sub">{batch.id}</div>
                </div>
                <div className="fs-modal__body">
                    {phase === 'upload' && (
                        <>
                            <div className="fs-upload-drop" onClick={() => fileRef.current?.click()}>
                                <div style={{ fontSize: '1.5rem' }}>📁</div>
                                <div style={{ fontSize: '0.79rem', color: 'var(--text-dim)' }}>Upload photo</div>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={startProcessing}
                            />
                            <button className="fs-btn-upload" onClick={() => fileRef.current?.click()}>
                                📸 Take/Upload Photo
                            </button>
                            <button className="fs-btn-cancel" onClick={onClose}>Cancel</button>
                        </>
                    )}
                    {phase === 'processing' && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div className="fs-spinner" />
                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '5px' }}>
                                Analysing...
                            </div>
                            <div className="fs-proc-step">{step}</div>
                        </div>
                    )}
                    {phase === 'result' && result && (
                        <>
                            <div style={{ display: 'flex', gap: '11px', alignItems: 'center', marginBottom: '14px' }}>
                                <span style={{ fontSize: '1.9rem' }}>{result.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.title}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{result.conf}</div>
                                </div>
                            </div>
                            <div style={{ background: 'var(--cream2)', borderRadius: '10px', padding: '11px 13px', marginBottom: '12px', fontSize: '0.78rem' }}>
                                {result.detail}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '7px' }}>
                                Recommended Actions
                            </div>
                            {result.sugs.map((s, i) => (
                                <div key={i} className="fs-result-sug">{s}</div>
                            ))}
                            <button className="fs-btn-upload" style={{ marginTop: '10px' }} onClick={onClose}>
                                ✓ Save Record
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

