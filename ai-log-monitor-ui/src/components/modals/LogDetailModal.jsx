import { useEffect } from 'react';

function LogDetailModal({ log, onClose }) {
    if (!log) return null;

    // Escape key & backdrop click to close
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).catch(() => {});
    };

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content shadow-lg border-0 rounded-4">
                    <div className="modal-header bg-dark text-white rounded-top-4">
                        <div className="d-flex align-items-center gap-2">
                            <span className={`badge ${
                                log.severity === 'ERROR' || log.severity === 'CRITICAL' ? 'bg-danger'
                                : log.severity === 'WARN' ? 'bg-warning text-dark'
                                : 'bg-success'
                            }`}>
                                {log.severity}
                            </span>
                            <span className="badge bg-secondary">{log.priority || 'NORMAL'}</span>
                            <h5 className="modal-title mb-0 ms-2 text-white">Log Analysis Detail #{log.id}</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        {/* Problem */}
                        <div className="mb-3">
                            <label className="text-muted small fw-bold text-uppercase">Problem Description</label>
                            <div className="p-3 panel-subtle border-start border-4 border-danger rounded-3 fw-semibold text-danger mt-1">
                                {log.problem || log.logContent}
                            </div>
                        </div>

                        {/* Cause */}
                        {log.cause && (
                            <div className="mb-3">
                                <label className="text-muted small fw-bold text-uppercase">Probable Cause</label>
                                <div className="p-3 panel-subtle border-start border-4 border-warning rounded-3 mt-1" style={{ color: 'var(--text-main)' }}>
                                    {log.cause}
                                </div>
                            </div>
                        )}

                        {/* Solution */}
                        {log.solution && (
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <label className="text-muted small fw-bold text-uppercase">Recommended Solution (AI RAG)</label>
                                    <button
                                        className="btn btn-sm btn-outline-success rounded-pill px-3 copy-btn"
                                        onClick={() => handleCopy(log.solution)}
                                        title="Copy solution to clipboard"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                                <div className="p-3 panel-subtle border-start border-4 border-success rounded-3 text-success font-monospace mt-1">
                                    {log.solution}
                                </div>
                            </div>
                        )}

                        {/* Meta */}
                        <div className="row g-2 mb-3">
                            <div className="col-md-6">
                                <div className="p-2 panel-subtle rounded text-muted small">
                                    <strong>First Seen:</strong> {new Date(log.analyzedAt).toLocaleString('en-US')}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-2 panel-subtle rounded text-muted small">
                                    <strong>Last Seen:</strong> {log.lastSeenAt ? new Date(log.lastSeenAt).toLocaleString('en-US') : '-'}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-2 panel-subtle rounded text-muted small">
                                    <strong>Repeat Count:</strong> {log.occurrenceCount || 1}x
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-2 panel-subtle rounded text-muted small">
                                    <strong>Priority:</strong> {log.priority || 'NORMAL'}
                                </div>
                            </div>
                        </div>

                        {/* Raw Log */}
                        <div>
                            <label className="text-muted small fw-bold text-uppercase">Raw Log Message</label>
                            <pre className="p-3 bg-dark text-light rounded-3 font-monospace small mb-0 mt-1" style={{ overflowX: 'auto' }} translate="no">
                                <code>{log.logContent}</code>
                            </pre>
                        </div>
                    </div>

                    <div className="modal-footer border-top-0">
                        <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogDetailModal;
