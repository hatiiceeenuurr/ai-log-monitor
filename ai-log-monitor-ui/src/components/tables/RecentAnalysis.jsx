import { useState } from 'react';
import LogDetailModal from '../modals/LogDetailModal';
import { useLanguage } from '../../context/LanguageContext';

function RecentAnalysis({ logs = [] }) {
    const { t } = useLanguage();
    const [selectedLog, setSelectedLog] = useState(null);

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

    const getPriorityBadge = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH':
                return <span className="badge bg-danger">HIGH</span>;
            case 'MEDIUM':
            case 'NORMAL':
                return <span className="badge bg-warning text-dark">NORMAL</span>;
            case 'LOW':
            default:
                return <span className="badge bg-info text-dark">LOW</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            <div className="card shadow-sm mt-4 border-0 rounded-3 overflow-hidden">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="mb-0 fw-bold fs-6 text-white">{t('recentAnalyses')}</h5>
                    <span className="badge bg-secondary rounded-pill px-3">{logs.length} {t('tbCount')}</span>
                </div>

                <div className="card-body p-0">
                    {logs.length === 0 ? (
                        <div className="p-4 text-center text-muted">
                            {t('noLogsFound')}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="table-light text-uppercase small text-muted">
                                    <tr>
                                        <th>{t('tbTimestamp')}</th>
                                        <th>{t('tbSeverity')}</th>
                                        <th>Priority</th>
                                        <th>{t('repeats')}</th>
                                        <th>{t('tbProblem')}</th>
                                        <th>{t('tbSolution')}</th>
                                        <th className="text-end">{t('tbActions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={log.id || index} style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(log)}>
                                            <td className="text-nowrap small text-muted">
                                                {formatDate(log.lastSeenAt || log.analyzedAt)}
                                            </td>
                                            <td>{getSeverityBadge(log.severity)}</td>
                                            <td>{getPriorityBadge(log.priority)}</td>
                                            <td>
                                                <span className={`badge ${log.occurrenceCount > 1 ? 'bg-primary' : 'bg-light text-dark border'}`}>
                                                    {log.occurrenceCount || 1}x
                                                </span>
                                            </td>
                                            <td className="fw-semibold">{log.problem || log.logContent}</td>
                                            <td className="small text-secondary">{log.solution ? (log.solution.length > 60 ? log.solution.substring(0, 60) + '...' : log.solution) : '-'}</td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                                                    {t('viewDetails')} 🔍
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedLog && (
                <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
            )}
        </>
    );
}

export default RecentAnalysis;