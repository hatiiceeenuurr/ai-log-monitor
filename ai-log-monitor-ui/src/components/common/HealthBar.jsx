import { useState, useEffect } from 'react';
import { getHealthStatus } from '../../services/api';

function HealthBar() {
    const [status, setStatus] = useState({
        backend: 'loading',
        db: 'loading',
        ai: 'loading',
        mail: 'loading'
    });

    useEffect(() => {
        let isMounted = true;
        const fetchStatus = async () => {
            try {
                const data = await getHealthStatus();
                if (isMounted) {
                    setStatus({
                        backend: data.backend || 'live',
                        db: data.db || 'connected',
                        ai: data.ai || 'active',
                        mail: data.mail || 'ready'
                    });
                }
            } catch (err) {
                console.error("Health check failed:", err);
                if (isMounted) {
                    setStatus({
                        backend: 'offline',
                        db: 'offline',
                        ai: 'offline',
                        mail: 'offline'
                    });
                }
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Check every 30 seconds
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const isOffline = (val) => val === 'offline' || val === 'error';

    return (
        <div className="d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded-pill health-bar-container shadow-sm" translate="no">
            <span className={`health-badge ${isOffline(status.backend) ? 'text-danger fw-bold' : 'text-success'}`} title={`Backend: ${status.backend}`}>
                <i className={`bi bi-circle-fill me-1 ${isOffline(status.backend) ? '' : 'pulse-dot'}`}></i> API Port 8081
            </span>
            <span className="health-divider">|</span>
            <span className={`health-badge ${isOffline(status.db) ? 'text-danger fw-bold' : 'text-info'}`} title={`Database: ${status.db}`}>
                <i className="bi bi-database-fill me-1"></i> PostgreSQL
            </span>
            <span className="health-divider">|</span>
            <span className={`health-badge ${isOffline(status.ai) ? 'text-danger fw-bold' : 'text-warning'}`} title={`Ollama AI: ${status.ai}`}>
                <i className="bi bi-cpu-fill me-1"></i> Ollama AI
            </span>
            <span className="health-divider">|</span>
            <span className={`health-badge ${isOffline(status.mail) ? 'text-danger fw-bold' : 'text-primary'}`} title={`SMTP: ${status.mail}`}>
                <i className="bi bi-envelope-check-fill me-1"></i> Gmail SMTP
            </span>
        </div>
    );
}

export default HealthBar;
