import { useState, useEffect } from 'react';
import { getLogsPaginated } from '../services/api';
import LogDetailModal from '../components/modals/LogDetailModal';
import { exportLogsToCSV } from '../utils/exportUtils';

function Analysis() {
    const [pageData, setPageData] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await getLogsPaginated(page, pageSize, filterSeverity, searchTerm);
            setPageData(data);
        } catch (err) {
            console.error("Failed to load historical log analyses:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLogs();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [page, pageSize, filterSeverity, searchTerm]);

    const handleCopySolution = (logId, text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(logId);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const logs = pageData.content || [];
    const filteredLogs = logs;

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

    const getBorderClass = (severity) => {
        switch (severity?.toUpperCase()) {
            case 'ERROR':
            case 'CRITICAL': return 'border-danger';
            case 'WARN':
            case 'WARNING': return 'border-warning';
            default: return 'border-success';
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="mb-0 fw-bold">Historical Log Analysis Records</h2>
                    <small className="text-muted">Total {pageData.totalElements || 0} analyses registered</small>
                </div>
                <button
                    className="btn btn-outline-success btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                    onClick={() => exportLogsToCSV(filteredLogs, 'historical_log_analysis.csv')}
                >
                    <span>📥</span> Export CSV Report
                </button>
            </div>

            <div className="row mb-4 g-3">
                <div className="col-md-5">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search by problem, content or solution..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                    />
                </div>
                <div className="col-md-3">
                    <select 
                        className="form-select"
                        value={filterSeverity}
                        onChange={(e) => { setFilterSeverity(e.target.value); setPage(0); }}
                    >
                        <option value="ALL">All Severities</option>
                        <option value="ERROR" translate="no">ERROR</option>
                        <option value="WARN" translate="no">WARN</option>
                        <option value="INFO" translate="no">INFO</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <select 
                        className="form-select"
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                    >
                        <option value="5">5 / Page</option>
                        <option value="10">10 / Page</option>
                        <option value="20">20 / Page</option>
                        <option value="50">50 / Page</option>
                    </select>
                </div>
            </div>

            {loading && (
                <div className="text-center mb-3">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted small">Loading records...</span>
                </div>
            )}

            {!loading && filteredLogs.length === 0 ? (
                <div className="alert alert-info text-center shadow-sm border-0 rounded-3">
                    No matching log records found.
                </div>
            ) : (
                <div className={loading ? "opacity-50 pointer-events-none" : ""}>
                    <div className="row g-3">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="col-12">
                                <div className={`card shadow-sm border-start border-4 ${getBorderClass(log.severity)}`}>
                                    <div className="card-header bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">
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
                                        <div className="d-flex align-items-center gap-2">
                                            {log.solution && (
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-pill px-3 copy-btn"
                                                    onClick={() => handleCopySolution(log.id, log.solution)}
                                                >
                                                    {copiedId === log.id ? 'Copied! ✓' : '📋 Copy Solution'}
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3" 
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                Inspect Details 🔍
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h6 className="card-title text-danger mb-2">Problem: {log.problem}</h6>
                                        {log.cause && <p className="card-text mb-1"><strong>Cause:</strong> {log.cause}</p>}
                                        {log.solution && (
                                            <div className="mb-3">
                                                <strong className="text-success small d-block mb-1">Recommended AI Solution:</strong>
                                                <div className="solution-code-box" translate="yes">
                                                    {log.solution}
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-3 mt-3 rounded-3 font-monospace small" style={{ backgroundColor: 'var(--code-bg)', color: 'var(--code-text)', overflowX: 'auto' }} translate="no">
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
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                        >
                            &laquo; Previous Page
                        </button>

                        <span className="small text-muted fw-semibold">
                            Page {page + 1} of {pageData.totalPages || 1}
                        </span>

                        <button 
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            disabled={page >= (pageData.totalPages - 1)}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next Page &raquo;
                        </button>
                    </div>
                </div>
            )}

            {selectedLog && (
                <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
            )}
        </div>
    );
}

export default Analysis;