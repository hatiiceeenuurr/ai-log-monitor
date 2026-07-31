import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLogsPaginated } from '../services/api';
import LogDetailModal from '../components/modals/LogDetailModal';
import { exportLogsToCSV } from '../utils/exportUtils';


function Analysis() {
    const { t } = useTranslation();
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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString('en-US');
        } catch(e) {
            return '-';
        }
    };

    const logs = pageData.content || [];
    const filteredLogs = logs;

    const getSeverityBadge = (severity) => {
        switch (severity?.toUpperCase()) {
            case 'ERROR':
            case 'CRITICAL':
                return <span className="badge bg-danger">{t(`badges.${severity.toLowerCase()}`)}</span>;
            case 'WARN':
            case 'WARNING':
                return <span className="badge bg-warning text-dark">{t('badges.warn')}</span>;
            case 'INFO':
            default:
                return <span className="badge bg-success">{t('badges.info')}</span>;
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
                    <h2 className="mb-0 fw-bold">{t('analysis.title')}</h2>
                    <small className="text-muted">{t('analysis.subtitle', { count: pageData.totalElements || 0 })}</small>
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
                        placeholder={t("analysis.search_placeholder")} 
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
                        <option value="ALL">{t('analysis.filter_all')}</option>
                        <option value="ERROR" translate="no">{t('badges.error')}</option>
                        <option value="WARN" translate="no">{t('badges.warn')}</option>
                        <option value="INFO" translate="no">{t('badges.info')}</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <select 
                        className="form-select"
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                    >
                        <option value="5">{t('analysis.page_size', { size: 5 })}</option>
                        <option value="10">{t('analysis.page_size', { size: 10 })}</option>
                        <option value="20">{t('analysis.page_size', { size: 20 })}</option>
                        <option value="50">{t('analysis.page_size', { size: 50 })}</option>
                    </select>
                </div>
            </div>

            {loading && (
                <div className="text-center mb-3">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted small">{t('analysis.loading')}</span>
                </div>
            )}

            {!loading && filteredLogs.length === 0 ? (
                <div className="alert alert-info text-center shadow-sm border-0 rounded-3">
                    {t('analysis.no_records')}
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
                                            <span className="ms-2 badge bg-secondary">{log.priority ? t(`badges.${log.priority.toLowerCase()}`) : t('badges.normal')}</span>
                                            <span className={`ms-2 badge ${log.occurrenceCount > 1 ? 'bg-primary' : 'bg-outline-secondary'}`}>
                                                {t('analysis.repeats', { count: log.occurrenceCount || 1 })}
                                            </span>
                                            <span className="ms-2 text-muted small">
                                                {t('analysis.first_seen')} {formatDate(log.analyzedAt)}
                                                {log.lastSeenAt && ` | ${t('analysis.last_seen')} ${formatDate(log.lastSeenAt)}`}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            {log.solution && (
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-pill px-3 copy-btn"
                                                    onClick={() => handleCopySolution(log.id, log.solution)}
                                                >
                                                    {copiedId === log.id ? t('analysis.copied') : t('analysis.copy_solution')}
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3" 
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                {t('analysis.inspect_details')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h6 className="card-title text-danger mb-2">
                                            {t('analysis.problem')} <span translate="yes">{log.problem}</span>
                                        </h6>
                                        {log.cause && <p className="card-text mb-1"><strong>{t('analysis.cause')}</strong> <span translate="yes">{log.cause}</span></p>}
                                        {log.solution && (
                                            <div className="mb-3">
                                                <strong className="text-success small d-block mb-1">{t('analysis.recommended_solution')}</strong>
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
                            &laquo; {t('analysis.prev_page').replace('« ', '')}
                        </button>

                        <span className="small text-muted fw-semibold">
                            {t('analysis.page_info', { current: page + 1, total: pageData.totalPages || 1 })}
                        </span>

                        <button 
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            disabled={page >= (pageData.totalPages - 1)}
                            onClick={() => setPage(p => p + 1)}
                        >
                            {t('analysis.next_page').replace(' »', '')} &raquo;
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
