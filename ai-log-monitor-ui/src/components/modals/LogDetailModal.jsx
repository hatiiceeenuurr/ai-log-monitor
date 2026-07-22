function LogDetailModal({ log, onClose }) {
    if (!log) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-4">
                    <div className="modal-header bg-dark text-white rounded-top-4">
                        <div className="d-flex align-items-center gap-2">
                            <span className={`badge ${log.severity === 'ERROR' ? 'bg-danger' : log.severity === 'WARN' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                {log.severity}
                            </span>
                            <span className="badge bg-secondary">{log.priority || 'NORMAL'}</span>
                            <h5 className="modal-title mb-0 ms-2">Log Analiz Detayı #{log.id}</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="text-muted small fw-bold uppercase">Problem Tanımı</label>
                            <div className="p-3 bg-light border-start border-4 border-danger rounded-3 fw-semibold text-danger">
                                {log.problem || log.logContent}
                            </div>
                        </div>

                        {log.cause && (
                            <div className="mb-3">
                                <label className="text-muted small fw-bold uppercase">Muhtemel Neden</label>
                                <div className="p-3 bg-light border-start border-4 border-warning rounded-3 text-dark">
                                    {log.cause}
                                </div>
                            </div>
                        )}

                        {log.solution && (
                            <div className="mb-3">
                                <label className="text-muted small fw-bold uppercase">Önerilen Çözüm (AI RAG)</label>
                                <div className="p-3 bg-light border-start border-4 border-success rounded-3 text-success font-monospace">
                                    {log.solution}
                                </div>
                            </div>
                        )}

                        <div className="row g-2 mb-3">
                            <div className="col-md-6">
                                <div className="p-2 border rounded text-muted small">
                                    <strong>İlk Analiz:</strong> {new Date(log.analyzedAt).toLocaleString('tr-TR')}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-2 border rounded text-muted small">
                                    <strong>Tekrar Sayısı:</strong> {log.occurrenceCount || 1}x
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-muted small fw-bold uppercase">Ham Log Mesajı</label>
                            <pre className="p-3 bg-dark text-light rounded-3 font-monospace small mb-0" style={{ overflowX: 'auto' }}>
                                <code>{log.logContent}</code>
                            </pre>
                        </div>
                    </div>

                    <div className="modal-footer border-top-0">
                        <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={onClose}>
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogDetailModal;
