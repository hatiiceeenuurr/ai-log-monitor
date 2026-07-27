import { useState } from 'react';
import { resetAllLogData } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function Scan() {
    const { t } = useLanguage();
    const [resetting, setResetting] = useState(false);
    const [message, setMessage] = useState('');

    const handleResetData = async () => {
        if (!window.confirm("ARE YOU SURE? This will truncate all database log analysis records and vector embeddings.")) {
            return;
        }

        try {
            setResetting(true);
            const res = await resetAllLogData();
            setMessage(res.message || "All database records have been reset successfully.");
        } catch (err) {
            console.error("Reset data error:", err);
            setMessage("Failed to reset database data.");
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">{t('scanTitle')}</h2>
                <p className="text-muted small mb-0">{t('scanSub')}</p>
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
                                <small className="text-muted fw-bold uppercase d-block">{t('ingestionInterval')}</small>
                                <h5 className="fw-bold mb-0">{t('every15Mins')}</h5>
                                <span className="badge bg-success mt-1">{t('activeScheduler')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-success bg-opacity-10 text-success rounded-3 fs-3">🛡️</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">{t('truncateStrategy')}</small>
                                <h5 className="fw-bold mb-0">{t('atomicTruncate')}</h5>
                                <span className="badge bg-info text-dark mt-1">{t('zeroLogLoss')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3 fs-3">🧠</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">{t('deduplication')}</small>
                                <h5 className="fw-bold mb-0">{t('sha256Hash')}</h5>
                                <span className="badge bg-primary mt-1">{t('patternCounter')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3 fs-3">📅</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">{t('retentionPolicy')}</small>
                                <h5 className="fw-bold mb-0">{t('clean14Days')}</h5>
                                <span className="badge bg-secondary mt-1">{t('nightlyCleanup')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                <h5 className="fw-bold mb-3">{t('adminMaintenance')}</h5>
                <p className="text-muted small">
                    {t('adminDesc')}
                </p>
                <div>
                    <button 
                        className="btn btn-outline-danger px-4 rounded-pill fw-bold"
                        onClick={handleResetData}
                        disabled={resetting}
                    >
                        {resetting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {t('resettingDb')}
                            </>
                        ) : t('resetDb')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Scan;