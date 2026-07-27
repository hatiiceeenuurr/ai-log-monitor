import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function HealthBar() {
    const { t } = useLanguage();

    return (
        <div className="d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded-pill health-bar-container shadow-sm">
            <span className="health-badge text-success">
                <i className="bi bi-circle-fill me-1 pulse-dot"></i> {t('port')} 8081
            </span>
            <span className="health-divider">|</span>
            <span className="health-badge text-info">
                <i className="bi bi-database-fill me-1"></i> {t('postgres')}
            </span>
            <span className="health-divider">|</span>
            <span className="health-badge text-warning">
                <i className="bi bi-cpu-fill me-1"></i> {t('ollama')}
            </span>
            <span className="health-divider">|</span>
            <span className="health-badge text-primary">
                <i className="bi bi-envelope-check-fill me-1"></i> {t('gmailSmtp')}
            </span>
        </div>
    );
}

export default HealthBar;
