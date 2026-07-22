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
            console.error("Failed to load historical log analyses:", err);
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
            <h2 className="mb-4">Historical Log Analysis Records</h2>

            <div className="row mb-4 g-3">
                <div className="col-md-5">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search by problem, content or solution..." 
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
                        <option value="ALL">All Severities</option>
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
                        <option value="5">5 Records / Page</option>
                        <option value="10">10 Records / Page</option>
                        <option value="20">20 Records / Page</option>
                        <option value="50">50 Records / Page</option>
                    </select>
                </div>
                <div className="col-md-2 text-end align-self-center">
                    <span className="text-muted small">Total {pageData.totalElements || 0} records</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="alert alert-info text-center">
                    No matching log records found.
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
                                                {log.occurrenceCount || 1}x Repeats
                                            </span>
                                            <span className="ms-2 text-muted small">
                                                First: {new Date(log.analyzedAt).toLocaleString('en-US')}
                                                {log.lastSeenAt && ` | Last: ${new Date(log.lastSeenAt).toLocaleString('en-US')}`}
                                            </span>
                                        </div>
                                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                                            Inspect Details 🔍
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        <h6 className="card-title text-danger mb-2">Problem: {log.problem}</h6>
                                        {log.cause && <p className="card-text mb-1"><strong>Cause:</strong> {log.cause}</p>}
                                        {log.solution && <p className="card-text mb-2 text-success"><strong>Solution:</strong> {log.solution}</p>}
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
                            &laquo; Previous Page
                        </button>

                        <span className="small text-muted">
                            Page {page + 1} of {pageData.totalPages || 1}
                        </span>

                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            disabled={page >= (pageData.totalPages - 1)}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next Page &raquo;
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