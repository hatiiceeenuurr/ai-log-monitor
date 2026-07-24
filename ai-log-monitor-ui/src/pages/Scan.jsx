import { useState } from 'react';
import { resetAllLogData } from '../services/api';

function Scan() {
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
                <h2 className="fw-bold mb-1">Scan Scheduler & System Status</h2>
                <p className="text-muted small mb-0">Automated log ingestion, pattern deduplication, and retention policies</p>
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
                                <small className="text-muted fw-bold uppercase d-block">Ingestion Interval</small>
                                <h5 className="fw-bold mb-0">Every 15 Mins</h5>
                                <span className="badge bg-success mt-1">Active Scheduler</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-success bg-opacity-10 text-success rounded-3 fs-3">🛡️</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">Truncate Strategy</small>
                                <h5 className="fw-bold mb-0">Atomic TRUNCATE</h5>
                                <span className="badge bg-info text-dark mt-1">Zero Log Loss</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3 fs-3">🧠</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">Deduplication</small>
                                <h5 className="fw-bold mb-0">SHA-256 Hash</h5>
                                <span className="badge bg-primary mt-1">Pattern Counter</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3 fs-3">📅</div>
                            <div>
                                <small className="text-muted fw-bold uppercase d-block">Retention Policy</small>
                                <h5 className="fw-bold mb-0">14 Days Clean</h5>
                                <span className="badge bg-secondary mt-1">Nightly Cleanup</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                <h5 className="fw-bold mb-3">🛠️ Admin Maintenance & Database Management</h5>
                <p className="text-muted small">
                    Use this administrative action to reset all historical log analyses, PGVector embeddings, and scan records if you wish to restart monitoring from a clean state.
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
                                Resetting Database...
                            </>
                        ) : 'Reset Database Records (TRUNCATE)'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Scan;