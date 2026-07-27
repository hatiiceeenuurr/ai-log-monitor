import { useState, useEffect } from 'react';
import { getLogsPaginated } from '../services/api';
import LogDetailModal from '../components/modals/LogDetailModal';
import { exportLogsToCSV } from '../utils/exportUtils';
import { useLanguage } from '../context/LanguageContext';

function Analysis() {
    const { t } = useLanguage();
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

    const handleCopySolution = (logId, text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(logId);
        setTimeout(() => setCopiedId(null), 2500);
    };

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
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="mb-0 fw-bold">{t('analysisTitle')}</h2>
                    <small className="text-muted">{t('analysisSub')}</small>
                </div>
                <button
                    className="btn btn-outline-success btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                    onClick={() => exportLogsToCSV(filteredLogs, 'historical_log_analysis.csv')}
                >
                    <span>📥</span> {t('exportCsv')}
                </button>
            </div>

            <div className="row mb-4 g-3">
                <div className="col-md-5">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder={t('searchLogs')}
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
                        <option value="ALL">{t('allSeverity')}</option>
                        <option value="ERROR">{t('errorSeverity')}</option>
                        <option value="WARN">{t('warnSeverity')}</option>
                        <option value="INFO">{t('infoSeverity')}</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <select 
                        className="form-select"
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                    >
                        <option value="10">10 / {t('perPage')}</option>
                        <option value="20">20 / {t('perPage')}</option>
                        <option value="50">50 / {t('perPage')}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="alert alert-info text-center shadow-sm border-0 rounded-3">
                    {t('noLogsFound')}
                </div>
            ) : (
                <>
                    <div className="row g-3">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="col-12">
                                <div className="card shadow-sm border-start border-4 border-primary">
                                    <div className="card-header bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <div>
                                            {getSeverityBadge(log.severity)}
                                            <span className="ms-2 badge bg-secondary">{log.priority || 'NORMAL'}</span>
                                            <span className={`ms-2 badge ${log.occurrenceCount > 1 ? 'bg-primary' : 'bg-outline-secondary'}`}>
                                                {log.occurrenceCount || 1}x {t('repeats')}
                                            </span>
                                            <span className="ms-2 text-muted small">
                                                {t('firstSeen')}: {new Date(log.analyzedAt).toLocaleString()}
                                                {log.lastSeenAt && ` | ${t('lastSeen')}: ${new Date(log.lastSeenAt).toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            {log.solution && (
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-pill px-3 copy-btn"
                                                    onClick={() => handleCopySolution(log.id, log.solution)}
                                                >
                                                    {copiedId === log.id ? t('copied') : t('copySolution')}
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3" 
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                {t('viewDetails')} 🔍
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h6 className="card-title text-danger mb-2">{t('normProblem')}: {log.problem}</h6>
                                        {log.cause && <p className="card-text mb-1"><strong>{t('rootCause')}:</strong> {log.cause}</p>}
                                        {log.solution && (
                                            <div className="mb-3">
                                                <strong className="text-success small d-block mb-1">{t('recSolution')}:</strong>
                                                <div className="solution-code-box">
                                                    <code>{log.solution}</code>
                                                </div>
                                            </div>
                                        )}
                                        <div className="bg-dark text-light p-2 rounded small font-monospace">
                                            <code>{log.logContent}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button 
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                        >
                            &laquo; {t('prev')}
                        </button>

                        <span className="small text-muted fw-semibold">
                            {t('page')} {page + 1} {t('of')} {pageData.totalPages || 1}
                        </span>

                        <button 
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            disabled={page >= (pageData.totalPages - 1)}
                            onClick={() => setPage(p => p + 1)}
                        >
                            {t('next')} &raquo;
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