import { useState, useEffect } from 'react';
import StatCard from "../components/cards/StatCard";
import RecentAnalysis from "../components/tables/RecentAnalysis";
import { getDashboardData, subscribeToLogStream } from "../services/api";

function Dashboard() {
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
            setLiveEventAlert(`Live Event Detected: [${newAnalysis.severity}] ${newAnalysis.problem || newAnalysis.logContent}`);
            
            // Auto refresh dashboard data instantly
            loadDashboard();

            // Clear banner after 5s
            setTimeout(() => setLiveEventAlert(null), 5000);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">AI Log Monitor Dashboard</h2>
                    <small className="text-success fw-bold">● Live SSE Stream Active</small>
                </div>
                <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {liveEventAlert && (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    <strong>⚡ Live Notification:</strong> {liveEventAlert}
                    <button type="button" className="btn-close" onClick={() => setLiveEventAlert(null)}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-warning" role="alert">
                    {error} (Please check if the backend service is running)
                </div>
            )}

            <div className="row">
                <StatCard
                    title="Total Analyses"
                    value={data.totalLogs || 0}
                    color="primary"
                />

                <StatCard
                    title="Errors (Error)"
                    value={data.errorCount || 0}
                    color="danger"
                />

                <StatCard
                    title="Warnings (Warn)"
                    value={data.warnCount || 0}
                    color="warning"
                />

                <StatCard
                    title="Information (Info)"
                    value={data.infoCount || 0}
                    color="success"
                />
            </div>

            {data.lastAnalysis && (
                <div className="text-end text-muted small mt-2">
                    Last Analysis Time: {new Date(data.lastAnalysis).toLocaleString('en-US')}
                </div>
            )}

            <RecentAnalysis logs={data.recentLogs || []} />
        </div>
    );
}

export default Dashboard;