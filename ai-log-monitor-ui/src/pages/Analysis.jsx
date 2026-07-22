import { useState, useEffect } from 'react';
import { getLogsPaginated } from '../services/api';
import LogDetailModal from '../components/modals/LogDetailModal';

function Analysis() {
    const [pageData, setPageData] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await getLogsPaginated(page, pageSize);
            setPageData(data);
        } catch (err) {
            console.error("Geçmiş analizler yüklenirken hata oluştu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, pageSize]);

    const logs = pageData.content || [];
    const filteredLogs = logs.filter(log => {
        const matchesSeverity = filterSeverity === 'ALL' || log.severity?.toUpperCase() === filterSeverity;
        const matchesSearch = !searchTerm || 
            log.problem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.logContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.solution?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSeverity && matchesSearch;
    });

    const getSeverityBadge = (severity) => {
        switch (severity?.toUpperCase()) {
            case 'ERROR':
            case 'CRITICAL':
                return <span className="badge bg-danger">ERROR</span>;
            case 'WARN':
            case 'WARNING':
                return <span className="badge bg-warning text-dark">WARN</span>;
            case 'INFO':
            default:
                return <span className="badge bg-success">INFO</span>;
        }
    };

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4">Tüm Geçmiş Log Analiz Kayıtları</h2>

            <div className="row mb-4 g-3">
                <div className="col-md-5">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Sayfa içinde problem, içerik veya çözüm ara..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select 
                        className="form-select"
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                    >
                        <option value="ALL">Tüm Seviyeler</option>
                        <option value="ERROR">ERROR</option>
                        <option value="WARN">WARN</option>
                        <option value="INFO">INFO</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <select 
                        className="form-select"
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                    >
                        <option value="5">5 Kayıt / Sayfa</option>
                        <option value="10">10 Kayıt / Sayfa</option>
                        <option value="20">20 Kayıt / Sayfa</option>
                        <option value="50">50 Kayıt / Sayfa</option>
                    </select>
                </div>
                <div className="col-md-2 text-end align-self-center">
                    <span className="text-muted small">Toplam {pageData.totalElements || 0} kayıt</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="alert alert-info text-center">
                    Kayıt bulunamadı.
                </div>
            ) : (
                <>
                    <div className="row g-3">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="col-12">
                                <div className="card shadow-sm border-start border-4 border-primary" style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(log)}>
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                        <div>
                                            {getSeverityBadge(log.severity)}
                                            <span className="ms-2 badge bg-secondary">{log.priority || 'NORMAL'}</span>
                                            <span className={`ms-2 badge ${log.occurrenceCount > 1 ? 'bg-primary' : 'bg-outline-secondary'}`}>
                                                {log.occurrenceCount || 1}x Tekrar
                                            </span>
                                            <span className="ms-2 text-muted small">
                                                İlk: {new Date(log.analyzedAt).toLocaleString('tr-TR')}
                                                {log.lastSeenAt && ` | Son: ${new Date(log.lastSeenAt).toLocaleString('tr-TR')}`}
                                            </span>
                                        </div>
                                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                                            Detaylı İncele 🔍
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        <h6 className="card-title text-danger mb-2">Problem: {log.problem}</h6>
                                        {log.cause && <p className="card-text mb-1"><strong>Neden:</strong> {log.cause}</p>}
                                        {log.solution && <p className="card-text mb-2 text-success"><strong>Çözüm:</strong> {log.solution}</p>}
                                        <div className="bg-dark text-light p-2 rounded small font-monospace">
                                            <code>{log.logContent}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                        >
                            &laquo; Önceki Sayfa
                        </button>

                        <span className="small text-muted">
                            Sayfa {page + 1} / {pageData.totalPages || 1}
                        </span>

                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            disabled={page >= (pageData.totalPages - 1)}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Sonraki Sayfa &raquo;
                        </button>
                    </div>
                </>
            )}

            {selectedLog && (
                <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
            )}
        </div>
    );
}

export default Analysis;