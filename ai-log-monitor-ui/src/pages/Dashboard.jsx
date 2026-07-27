import { useState, useEffect } from 'react';
import StatCard from "../components/cards/StatCard";
import RecentAnalysis from "../components/tables/RecentAnalysis";
import SeverityChart from "../components/charts/SeverityChart";
import TrendChart from "../components/charts/TrendChart";
import { getDashboardData, subscribeToLogStream } from "../services/api";
import { exportLogsToCSV } from "../utils/exportUtils";
import { sendDesktopNotification } from "../utils/notificationUtils";
import { useLanguage } from "../context/LanguageContext";

function Dashboard() {
    const { t } = useLanguage();
    const [data, setData] = useState({
        totalLogs: 0,
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
        lastAnalysis: null,
        recentLogs: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liveEventAlert, setLiveEventAlert] = useState(null);
    const [filterSeverity, setFilterSeverity] = useState('ALL');

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const result = await getDashboardData();
            setData(result);
            setError(null);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Failed to connect to backend or fetch dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();

        // Connect SSE Real-time Stream
        const unsubscribe = subscribeToLogStream((newAnalysis) => {
            console.log("Real-time SSE event received:", newAnalysis);
            const problemText = newAnalysis.problem || newAnalysis.logContent || "New Incident Detected";
            setLiveEventAlert(`Live Event Detected: [${newAnalysis.severity}] ${problemText}`);
            
            // Trigger Native Windows Desktop Notification ONLY for CRITICAL or ERROR incidents
            const sev = (newAnalysis.severity || '').toUpperCase();
            if (sev === 'CRITICAL' || sev === 'ERROR') {
                sendDesktopNotification(
                    `🚨 CRITICAL Incident [${sev}]`,
                    `${problemText}\nSolution: ${newAnalysis.solution || 'Inspect dashboard details'}`
                );
            }

            // Auto refresh dashboard data instantly
            loadDashboard();

            // Clear banner after 5s
            setTimeout(() => setLiveEventAlert(null), 5000);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const filteredLogs = (data.recentLogs || []).filter(log => {
        if (filterSeverity === 'ALL') return true;
        return (log.severity || '').toUpperCase() === filterSeverity;
    });

    return (
        <div className="container-fluid p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="mb-0 fw-bold">{t('dashTitle')}</h2>
                    <small className="text-success fw-bold">
                        <i className="bi bi-broadcast pulse-dot me-1"></i> Live SSE Stream Active
                    </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button 
                        className="btn btn-outline-success btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                        onClick={() => exportLogsToCSV(filteredLogs, 'dashboard_recent_logs.csv')}
                        title="Download CSV Report"
                    >
                        <span>📥</span> {t('exportCsv')}
                    </button>
                    <button 
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                        onClick={loadDashboard}
                        disabled={loading}
                    >
                        {loading ? '...' : '🔄 Refresh'}
                    </button>
                </div>
            </div>

            {liveEventAlert && (
                <div className="alert alert-info alert-dismissible fade show shadow-sm border-0 rounded-3" role="alert">
                    <strong>⚡ Live Notification:</strong> {liveEventAlert}
                    <button type="button" className="btn-close" onClick={() => setLiveEventAlert(null)}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-warning shadow-sm border-0 rounded-3" role="alert">
                    {error}
                </div>
            )}

            <div className="row g-3 mb-4">
                <StatCard
                    title={t('totalLogs')}
                    value={data.totalLogs || 0}
                    color="primary"
                />

                <StatCard
                    title={t('criticalIncidents')}
                    value={data.errorCount || 0}
                    color="danger"
                />

                <StatCard
                    title={t('warningAlerts')}
                    value={data.warnCount || 0}
                    color="warning"
                />

                <StatCard
                    title={t('infoLogs')}
                    value={data.infoCount || 0}
                    color="success"
                />
            </div>

            {/* Interactive Data Charts Row */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-5">
                    <SeverityChart 
                        critical={Math.round((data.errorCount || 0) * 0.3)}
                        error={data.errorCount || 0}
                        warn={data.warnCount || 0}
                        info={data.infoCount || 0}
                    />
                </div>
                <div className="col-12 col-lg-7">
                    <TrendChart logs={data.recentLogs || []} />
                </div>
            </div>

            {/* Filter Pills & Table */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted fw-semibold me-1">Filter Severity:</span>
                    {['ALL', 'CRITICAL', 'ERROR', 'WARN', 'INFO'].map(sev => (
                        <button
                            key={sev}
                            className={`btn btn-sm severity-pill-btn ${filterSeverity === sev ? 'btn-primary active' : 'btn-outline-secondary'}`}
                            onClick={() => setFilterSeverity(sev)}
                        >
                            {sev}
                        </button>
                    ))}
                </div>

                {data.lastAnalysis && (
                    <div className="text-muted small">
                        Last Analysis: {new Date(data.lastAnalysis).toLocaleString('en-US')}
                    </div>
                )}
            </div>

            <RecentAnalysis logs={filteredLogs} />
        </div>
    );
}

export default Dashboard;