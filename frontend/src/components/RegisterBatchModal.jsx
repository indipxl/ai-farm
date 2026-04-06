import toast from 'react-hot-toast';

const RegisterBatchModalStyle = {
    overlay: {
        backgroundColor: 'rgba(28, 31, 22, 0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000
    },
    modal: {
        backgroundColor: '#f0ece4',
        borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    header: { textAlign: 'center' },
    title: { color: '#1c1f16', margin: '4px 0', fontSize: '1.5rem' },
    subtitle: { color: '#7a7060', fontSize: '0.9rem', marginBottom: '24px' },
    grid: { display: 'grid', gap: '16px', marginBottom: '20px' },
    group: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: '#1c1f16', fontSize: '0.85rem', fontWeight: '600' },
    input: {
        padding: '12px', borderRadius: '8px', border: '1px solid #7a7060',
        backgroundColor: '#fff', fontSize: '0.95rem'
    },
    footer: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' },
    cancelBtn: {
        padding: '12px 20px', border: 'none', background: 'transparent',
        color: '#7a7060', cursor: 'pointer', fontWeight: '500'
    },
    submitBtn: {
        padding: '12px 24px', borderRadius: '8px', border: 'none',
        backgroundColor: '#c8973a', color: '#fff', fontWeight: 'bold'
    }
};

export default function RegisterBatchModal({ onClose, onSubmit, formData, setFormData, submitting }) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
        onClose();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isValid = formData.crop.trim() && formData.location.trim() && formData.planted;

    return (
        <div style={RegisterBatchModalStyle.overlay} onClick={onClose}>
            <div style={RegisterBatchModalStyle.modal} onClick={e => e.stopPropagation()}>
                <div style={RegisterBatchModalStyle.header}>
                    <h2 style={RegisterBatchModalStyle.title}>Create Batch</h2>
                    <p style={RegisterBatchModalStyle.subtitle}>Enter details for new crop cycle.</p>
                </div>
                <form onSubmit={handleSubmit} style={{ paddingBottom: '24px' }}>
                    <div style={RegisterBatchModalStyle.grid}>
                        <div style={RegisterBatchModalStyle.group}>
                            <label style={RegisterBatchModalStyle.label}>Crop *</label>
                            <input
                                style={RegisterBatchModalStyle.input}
                                name="crop"
                                placeholder="Tomatoes"
                                value={formData.crop}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>
                        <div style={RegisterBatchModalStyle.group}>
                            <label style={RegisterBatchModalStyle.label}>Location *</label>
                            <input
                                style={RegisterBatchModalStyle.input}
                                name="location"
                                placeholder="Block A · Row 1-12"
                                value={formData.location}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>
                        <div style={RegisterBatchModalStyle.group}>
                            <label style={RegisterBatchModalStyle.label}>Planted *</label>
                            <input
                                style={RegisterBatchModalStyle.input}
                                type="date"
                                name="planted"
                                value={formData.planted}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>
                        <div style={RegisterBatchModalStyle.group}>
                            <label style={RegisterBatchModalStyle.label}>Notes</label>
                            <textarea
                                style={{ ...RegisterBatchModalStyle.input, height: '80px', resize: 'none' }}
                                name="notes"
                                placeholder="Any additional notes..."
                                value={formData.notes}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>
                    </div>
                    <div style={RegisterBatchModalStyle.footer}>
                        <button
                            type="button"
                            style={RegisterBatchModalStyle.cancelBtn}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                ...RegisterBatchModalStyle.submitBtn,
                                opacity: (!isValid || submitting) ? 0.6 : 1,
                                cursor: (!isValid || submitting) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={!isValid || submitting}
                        >
                            {submitting ? 'Creating...' : 'Create Batch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

