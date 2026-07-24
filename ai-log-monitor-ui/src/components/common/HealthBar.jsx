import { useState, useEffect } from 'react';

function HealthBar() {
    const [status, setStatus] = useState({
        backend: 'live',
        db: 'connected',
        ai: 'active',
        mail: 'ready'
    });

    return (
        <div className="d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded-pill health-bar-container shadow-sm">
            <span className="health-badge text-success">
                <i className="bi bi-circle-fill me-1 pulse-dot"></i> API Port 8081
            </span>
            <span className="health-divider">|</span>
            <span className="health-badge text-info">
                <i className="bi bi-database-fill me-1"></i> PostgreSQL
            </span>
            <span className="health-divider">|</span>
            <span className="health-badge text-warning">
                <i className="bi bi-cpu-fill me-1"></i> Ollama AI
            </span>
            <span className="health-divider">|</span>
            <span className="health-badge text-primary">
                <i className="bi bi-envelope-check-fill me-1"></i> Gmail SMTP
            </span>
        </div>
    );
}

export default HealthBar;
