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
            console.error("Dashboard verisi alınamadı:", err);
            setError("Sunucuya bağlanılamadı veya veri yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();

        // Connect SSE Real-time Stream
        const unsubscribe = subscribeToLogStream((newAnalysis) => {
            console.log("Real-time SSE event received:", newAnalysis);
            setLiveEventAlert(`Canlı Log Tespit Edildi: [${newAnalysis.severity}] ${newAnalysis.problem || newAnalysis.logContent}`);
            
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
                    <h2 className="mb-0">AI Log Monitor Dashboard</h2>
                    <small className="text-success fw-bold">● Canlı SSE Akışı Aktif</small>
                </div>
                <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    {loading ? 'Yükleniyor...' : '🔄 Yenile'}
                </button>
            </div>

            {liveEventAlert && (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    <strong>⚡ Canlı Bildirim:</strong> {liveEventAlert}
                    <button type="button" className="btn-close" onClick={() => setLiveEventAlert(null)}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-warning" role="alert">
                    {error} (Backend çalışıyor mu kontrol ediniz)
                </div>
            )}

            <div className="row">
                <StatCard
                    title="Toplam Analiz"
                    value={data.totalLogs || 0}
                    color="primary"
                />

                <StatCard
                    title="Hata (Error)"
                    value={data.errorCount || 0}
                    color="danger"
                />

                <StatCard
                    title="Uyarı (Warn)"
                    value={data.warnCount || 0}
                    color="warning"
                />

                <StatCard
                    title="Bilgi (Info)"
                    value={data.infoCount || 0}
                    color="success"
                />
            </div>

            {data.lastAnalysis && (
                <div className="text-end text-muted small mt-2">
                    Son Analiz Zamanı: {new Date(data.lastAnalysis).toLocaleString('tr-TR')}
                </div>
            )}

            <RecentAnalysis logs={data.recentLogs || []} />
        </div>
    );
}

export default Dashboard;