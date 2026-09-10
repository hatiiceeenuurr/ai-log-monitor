import { useState, useEffect } from 'react';
import StatCard from "../components/cards/StatCard";
import RecentAnalysis from "../components/tables/RecentAnalysis";
import SeverityChart from "../components/charts/SeverityChart";
import TrendChart from "../components/charts/TrendChart";
import { getDashboardData, subscribeToLogStream } from "../services/api";
import { exportLogsToCSV } from "../utils/exportUtils";
import { requestNotificationPermission, sendDesktopNotification } from "../utils/notificationUtils";
import { useTranslation } from "react-i18next";
function Dashboard() {

    const [data, setData] = useState({
        totalLogs: 0,
        criticalCount: 0,
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
        lastAnalysis: null,
        recentLogs: [],
        dailyData: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liveEventAlert, setLiveEventAlert] = useState(null);
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [notifPerm, setNotifPerm] = useState('Notification' in window ? Notification.permission : 'denied');
    const { t, i18n } = useTranslation();

    const handleRequestNotification = async () => {
        const granted = await requestNotificationPermission();
        setNotifPerm(granted ? 'granted' : 'denied');
    };

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [result, dailyData] = await Promise.all([
                getDashboardData(),
                import('../services/api').then(m => m.getDailyAnalysis())
            ]);
            setData({ ...result, dailyData });
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
                    `🚨 ${sev} Incident Detected`,
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
                    <h2 className="mb-0 fw-bold">{t("dashboard.title")}</h2>
                    <div className="d-flex align-items-center mt-1">
                        <small className="text-success fw-bold me-2">
                            <i className="bi bi-broadcast pulse-dot me-1"></i> {t("dashboard.live_stream")}
                        </small>
                        {notifPerm === 'default' && (
                            <button 
                                className="btn btn-outline-warning btn-sm py-0 px-2 rounded-pill"
                                style={{ fontSize: '0.75rem' }}
                                onClick={handleRequestNotification}
                            >
                                🔔 {t("dashboard.enable_alerts")}
                            </button>
                        )}
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button 
                        className="btn btn-outline-success btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                        onClick={() => exportLogsToCSV(filteredLogs, 'dashboard_recent_logs.csv')}
                        title="Download CSV Report"
                    >
                        <span>📥</span> {t("dashboard.export_csv")}
                    </button>
                    <button 
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                        onClick={loadDashboard}
                        disabled={loading}
                    >
                        {loading ? t("dashboard.loading") : `🔄 ${t("dashboard.refresh")}`}
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

            <div className="row row-cols-2 row-cols-md-5 g-3 mb-4">
                <StatCard
                    title={t("dashboard.total_logs")}
                    value={data.totalLogs || 0}
                    color="primary"
                    icon="bi-bar-chart-fill"
                    onClick={() => setFilterSeverity('ALL')}
                />

                <StatCard
                    title={t("severity.critical")}
                    value={data.criticalCount || 0}
                    color="danger"
                    icon="bi-shield-fill-exclamation"
                    onClick={() => setFilterSeverity('CRITICAL')}
                />

                <StatCard
                    title={t("dashboard.error_logs")}
                    value={data.errorCount || 0}
                    color="danger"
                    icon="bi-exclamation-octagon-fill"
                    onClick={() => setFilterSeverity('ERROR')}
                />

                <StatCard
                    title={t("dashboard.warn_logs")}
                    value={data.warnCount || 0}
                    color="warning"
                    icon="bi-exclamation-triangle-fill"
                    onClick={() => setFilterSeverity('WARN')}
                />

                <StatCard
                    title={t("dashboard.info_logs")}
                    value={data.infoCount || 0}
                    color="success"
                    icon="bi-info-circle-fill"
                    onClick={() => setFilterSeverity('INFO')}
                />
            </div>

            {/* Interactive Data Charts Row */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-5">
                    <SeverityChart 
                        critical={data.criticalCount || 0}
                        error={data.errorCount || 0}
                        warn={data.warnCount || 0}
                        info={data.infoCount || 0}
                    />
                </div>
                <div className="col-12 col-lg-7">
                    <TrendChart dailyData={data.dailyData || []} />
                </div>
            </div>

            {/* Filter Pills & Table */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted fw-semibold me-1">{t("dashboard.filter_severity")}</span>
                    <div className="d-flex flex-wrap gap-2">
                        {['ALL', 'CRITICAL', 'ERROR', 'WARN', 'INFO'].map(sev => (
                            <button 
                                key={sev}
                                className={`btn btn-sm severity-pill-btn ${filterSeverity === sev ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                onClick={() => setFilterSeverity(sev)}
                            >
                                {t(`badges.${sev.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {data.lastAnalysis && (
                    <div className="text-muted small">
                        {t("dashboard.last_analysis")} {new Date(data.lastAnalysis).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}
                    </div>
                )}
            </div>

            <RecentAnalysis logs={filteredLogs} />
        </div>
    );
}

export default Dashboard;