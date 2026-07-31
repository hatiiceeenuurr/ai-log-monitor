import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


function LogDetailModal({ log, onClose }) {
    const { t } = useTranslation();
    

    // Escape key & backdrop click to close
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!log) return null;

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).catch(() => {});
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString('en-US');
        } catch(e) {
            return '-';
        }
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
                            }`} translate="no">
                                {log.severity}
                            </span>
                            <span className="badge bg-secondary" translate="no">{log.priority || 'NORMAL'}</span>
                            <h5 className="modal-title mb-0 ms-2 text-white">{t('modal.title', { id: log.id })}</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        {/* Problem */}
                        <div className="mb-3">
                            <label className="text-muted small fw-bold text-uppercase">{t('modal.problem')}</label>
                            <div className="p-3 panel-subtle border-start border-4 border-danger rounded-3 fw-semibold text-danger mt-1" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} translate="yes">
                                {log.problem || log.logContent}
                            </div>
                        </div>

                        {/* Cause */}
                        {log.cause && (
                            <div className="mb-3">
                                <label className="text-muted small fw-bold text-uppercase">{t('modal.cause')}</label>
                                <div className="p-3 panel-subtle border-start border-4 border-warning rounded-3 mt-1" style={{ color: 'var(--text-main)', wordBreak: 'break-word', overflowWrap: 'anywhere' }} translate="yes">
                                    {log.cause}
                                </div>
                            </div>
                        )}

                        {/* Solution */}
                        {log.solution && (
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <label className="text-muted small fw-bold text-uppercase">{t('modal.solution')}</label>
                                    <button
                                        className="btn btn-sm btn-outline-success rounded-pill px-3 copy-btn"
                                        onClick={() => handleCopy(log.solution)}
                                        title="Copy solution to clipboard"
                                    >
                                        📋 {t('modal.copy').replace('📋 ', '')}
                                    </button>
                                </div>
                                <div className="p-3 panel-subtle border-start border-4 border-success rounded-3 text-success font-monospace mt-1" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} translate="yes">
                                    {log.solution}
                                </div>
                            </div>
                        )}

                        {/* Meta */}
                        <div className="row g-2 mb-3">
                            <div className="col-md-6">
                                <div className="p-2 panel-subtle rounded text-muted small">
                                    <strong>{t('modal.first_seen')}</strong> {formatDate(log.analyzedAt)}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-2 panel-subtle rounded text-muted small">
                                    <strong>{t('modal.last_seen')}</strong> {formatDate(log.lastSeenAt)}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-2 panel-subtle rounded text-muted small">
                                    <strong>{t('modal.repeats')}</strong> {log.occurrenceCount || 1}x
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-2 panel-subtle rounded text-muted small">
                                    <strong>{t('modal.priority')}</strong> {log.priority || 'NORMAL'}
                                </div>
                            </div>
                        </div>

                        {/* Raw Log */}
                        <div>
                            <label className="text-muted small fw-bold text-uppercase">{t('modal.raw_log')}</label>
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
