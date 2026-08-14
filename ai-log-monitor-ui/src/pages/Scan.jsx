import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resetAllLogData } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function Scan() {
    const { t } = useTranslation();
    const [resetting, setResetting] = useState(false);
    const [message, setMessage] = useState('');

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const executeReset = async () => {
        setShowConfirmModal(false);
        try {
            setResetting(true);
            const res = await resetAllLogData();
            setMessage(res.message || t('scan.reset_success'));
        } catch (err) {
            console.error("Reset data error:", err);
            setMessage(t('scan.reset_fail'));
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">{t('scan.title')}</h2>
                <p className="text-muted small mb-0">{t('scan.subtitle')}</p>
            </div>

            {message && (
                <div className="alert alert-info alert-dismissible fade show rounded-4 shadow-sm mb-4" role="alert">
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
            )}

            <div className="row g-4 mb-4">
                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3 fs-3">⏱️</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">{t('scan.interval_title')}</small>
                                <h5 className="fw-bold mb-0">{t('scan.interval_val')}</h5>
                                <span className="badge bg-success mt-1">{t('scan.interval_badge')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-success bg-opacity-10 text-success rounded-3 fs-3">🛡️</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">{t('scan.truncate_title')}</small>
                                <h5 className="fw-bold mb-0">{t('scan.truncate_val')}</h5>
                                <span className="badge bg-info text-dark mt-1">{t('scan.truncate_badge')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3 fs-3">🧠</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">{t('scan.dedup_title')}</small>
                                <h5 className="fw-bold mb-0">{t('scan.dedup_val')}</h5>
                                <span className="badge bg-primary mt-1">{t('scan.dedup_badge')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3 fs-3">📅</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">{t('scan.retention_title')}</small>
                                <h5 className="fw-bold mb-0">{t('scan.retention_val')}</h5>
                                <span className="badge bg-secondary mt-1">{t('scan.retention_badge')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                <h5 className="fw-bold mb-3">{t('scan.admin_title')}</h5>
                <p className="text-muted small">
                    {t('scan.admin_desc')}
                </p>
                <div>
                    <button 
                        className="btn btn-outline-danger px-4 rounded-pill fw-bold"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={resetting}
                    >
                        {resetting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {t('scan.resetting')}
                            </>
                        ) : t('scan.reset_btn')}
                    </button>
                </div>
            </div>

            {/* Confirm Reset Modal */}
            {showConfirmModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-danger text-white rounded-top-4 border-0">
                                <h5 className="modal-title fw-bold">{t('scan.modal_title')}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <div className="mb-3" style={{ fontSize: '4rem' }}>🗑️</div>
                                <h4 className="fw-bold text-danger">{t('scan.modal_sure')}</h4>
                                <p className="text-muted mt-2">
                                    {t('scan.modal_desc')}
                                </p>
                            </div>
                            <div className="modal-footer border-0 d-flex justify-content-center pb-4">
                                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowConfirmModal(false)}>{t('scan.modal_cancel')}</button>
                                <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={executeReset}>{t('scan.modal_confirm')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Scan;
