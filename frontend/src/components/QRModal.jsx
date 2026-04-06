export default function QRModal({ batch, onClose }) {
    if (!batch) return null;

    return (
        <div className="fs-modal-overlay" onClick={onClose}>
            <div className="fs-modal" onClick={e => e.stopPropagation()}>
                <div className="fs-modal__header">
                    <div className="fs-modal__eyebrow">Batch QR Code</div>
                    <div className="fs-modal__title">{batch.crop}</div>
                    <div className="fs-modal__sub">Scan to link camera scans</div>
                </div>
                <div className="fs-modal__body" style={{ textAlign: 'center' }}>
                    <div className="fs-qr-box">▦</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gold-dim)', letterSpacing: '3px' }}>
                        {batch.id}
                    </div>
                    <p style={{ fontSize: '0.77rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
                        Print and attach to row marker.
                    </p>
                    <button className="fs-btn--primary fs-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

