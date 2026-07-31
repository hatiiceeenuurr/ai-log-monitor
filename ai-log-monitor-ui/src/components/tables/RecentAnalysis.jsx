import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogDetailModal from '../modals/LogDetailModal';

function RecentAnalysis({ logs = [] }) {
    const { t } = useTranslation();
    const [selectedLog, setSelectedLog] = useState(null);

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

    const getPriorityBadge = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH':
                return <span className="badge bg-danger">{t('badges.high')}</span>;
            case 'MEDIUM':
            case 'NORMAL':
                return <span className="badge bg-warning text-dark">{t('badges.normal')}</span>;
            case 'LOW':
            default:
                return <span className="badge bg-info text-dark">{t('badges.low')}</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US');
    };

    return (
        <>
            <div className="card shadow-sm mt-4 border-0 rounded-3 overflow-hidden">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="mb-0 fw-bold fs-6 text-white">{t('recent_analysis.title')}</h5>
                    <span className="badge bg-secondary rounded-pill px-3">{logs.length} {t('recent_analysis.records_count')}</span>
                </div>

                <div className="card-body p-0">
                    {logs.length === 0 ? (
                        <div className="p-4 text-center text-muted">
                            {t('recent_analysis.no_records')}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="table-light text-uppercase small text-muted">
                                    <tr>
                                        <th>{t('recent_analysis.date')}</th>
                                        <th>{t('recent_analysis.severity')}</th>
                                        <th>{t('recent_analysis.priority')}</th>
                                        <th>{t('recent_analysis.repeats')}</th>
                                        <th>{t('recent_analysis.problem')}</th>
                                        <th>{t('recent_analysis.solution')}</th>
                                        <th className="text-end">{t('recent_analysis.action')}</th>
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
                                                <span className={`badge ${log.occurrenceCount > 1 ? 'bg-primary' : 'bg-secondary bg-opacity-25 border'}`} style={{ color: 'var(--text-main)' }}>
                                                    {log.occurrenceCount || 1}x
                                                </span>
                                            </td>
                                            <td className="fw-semibold" style={{ color: 'var(--text-main)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} translate="yes">{log.problem || log.logContent}</td>
                                            <td className="small text-muted" translate="yes">{log.solution ? (log.solution.length > 60 ? log.solution.substring(0, 60) + '...' : log.solution) : '-'}</td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                                                    {t('recent_analysis.inspect')}
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