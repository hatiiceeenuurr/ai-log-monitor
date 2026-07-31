import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function SeverityChart({ critical = 0, error = 0, warn = 0, info = 0 }) {
    const { t } = useTranslation();
    const [hovered, setHovered] = useState(null);

    const total = critical + error + warn + info;
    if (total === 0) {
        return (
            <div className="card shadow-sm border-0 h-100 p-4 text-center d-flex align-items-center justify-content-center">
                <i className="bi bi-pie-chart text-muted display-4 mb-2"></i>
                <p className="text-muted mb-0">No log severity data available yet.</p>
            </div>
        );
    }

    const data = [
        { label: 'CRITICAL', labelKey: 'critical', count: critical, color: '#dc3545', lightColor: '#ff6b6b' },
        { label: 'ERROR', labelKey: 'error', count: error, color: '#fd7e14', lightColor: '#ff922b' },
        { label: 'WARN', labelKey: 'warn', count: warn, color: '#ffc107', lightColor: '#ffe066' },
        { label: 'INFO', labelKey: 'info', count: info, color: '#0d6efd', lightColor: '#4dabf7' }
    ];

    // Calculate SVG Donut Arcs
    const radius = 68;
    const strokeWidth = 18;
    const center = 100;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;

    return (
        <div className="card shadow-sm border-0 h-100 p-3 chart-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-uppercase tracking-wider">
                    <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                    {t('charts.severity_title')}
                </h6>
                <span className="badge bg-secondary-subtle text-body rounded-pill px-3 py-1">
                    {total} {t('charts.total_logs')}
                </span>
            </div>

            <div className="row align-items-center">
                <div className="col-12 col-sm-6 text-center mb-3 mb-sm-0 position-relative">
                    <svg viewBox="0 0 200 200" className="donut-svg">
                        {data.map((item, index) => {
                            const percentage = item.count / total;
                            const strokeDasharray = `${percentage * circumference} ${circumference}`;
                            const strokeDashoffset = -accumulatedAngle * circumference;
                            accumulatedAngle += percentage;

                            const isHovered = hovered === item.label;

                            return (
                                <circle
                                    key={item.label}
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="transparent"
                                    stroke={isHovered ? item.lightColor : item.color}
                                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    transform={`rotate(-90 ${center} ${center})`}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={() => setHovered(item.label)}
                                    onMouseLeave={() => setHovered(null)}
                                />
                            );
                        })}
                    </svg>
                    <div className="donut-center-text" translate="no">
                        <div className="fw-bold fs-4">{hovered ? data.find(d => d.label === hovered)?.count : total}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {hovered ? t(`severity.${data.find(d => d.label === hovered)?.labelKey}`) : t('charts.total_logs')}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6">
                    <div className="d-flex flex-column gap-2">
                        {data.map(item => {
                            const pct = ((item.count / total) * 100).toFixed(1);
                            const isHovered = hovered === item.label;
                            return (
                                <div
                                    key={item.label}
                                    className={`d-flex align-items-center justify-content-between p-2 rounded legend-item ${isHovered ? 'legend-hovered' : ''}`}
                                    onMouseEnter={() => setHovered(item.label)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                        <span className="fw-semibold small" translate="no">{t(`severity.${item.labelKey}`)}</span>
                                    </div>
                                    <div className="text-end">
                                        <span className="fw-bold small me-2">{item.count}</span>
                                        <span className="text-muted extra-small">({pct}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SeverityChart;
