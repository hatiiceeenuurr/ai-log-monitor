import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function TrendChart({ dailyData = [] }) {
    const { t } = useTranslation();
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Get last 7 days of data, or pad with 0s if not enough
    const last7Days = dailyData.slice(-7);
    
    // Fallback if no data
    const safeData = last7Days.length > 0 ? last7Days : [['No Data', 0]];
    const pointsCount = Math.max(safeData.length, 2); // Need at least 2 points to draw a line properly

    const labels = safeData.map(item => {
        if (item[0] === 'No Data') return item[0];
        const d = new Date(item[0]);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    const values = safeData.map(item => Number(item[1]) || 0);

    const maxValue = Math.max(...values, 10); // Ensure some height even for small values
    const width = 500;
    const height = 160;
    const padding = 25;

    // Calculate SVG coordinates
    const points = values.map((val, index) => {
        const x = padding + (index / (pointsCount - 1)) * (width - 2 * padding);
        const y = height - padding - (val / maxValue) * (height - 2 * padding);
        return { x, y, val, label: labels[index] };
    });

    const pathD = points.reduce((acc, point, index) => {
        return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="card shadow-sm border-0 h-100 p-3 chart-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0 text-uppercase tracking-wider">
                    <i className="bi bi-graph-up-arrow me-2 text-success"></i>
                    {t('charts.trend_title')}
                </h6>
                <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1">
                    {t('charts.real_time')}
                </span>
            </div>

            <div className="position-relative w-100 mt-2">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-100 h-auto overflow-visible">
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    {[0, 0.33, 0.66, 1].map((pct, idx) => {
                        const y = height - padding - pct * (height - 2 * padding);
                        return (
                            <line
                                key={idx}
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="var(--bs-border-color-translucent)"
                                strokeDasharray="4 4"
                            />
                        );
                    })}

                    {/* Area Fill */}
                    <path d={areaD} fill="url(#areaGradient)" />

                    {/* Gradient Line */}
                    <path d={pathD} fill="none" stroke="#0d6efd" strokeWidth="3" strokeLinecap="round" />

                    {/* Data Points */}
                    {points.map((pt, idx) => (
                        <g key={idx}>
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={hoveredPoint === idx ? "7" : "4"}
                                fill="#0d6efd"
                                stroke="#ffffff"
                                strokeWidth="2"
                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPoint(idx)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {/* X Axis Labels */}
                            <text
                                x={pt.x}
                                y={height - 5}
                                textAnchor="middle"
                                className="chart-axis-label"
                                fill="#adb5bd"
                                fontSize="10"
                            >
                                {pt.label}
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredPoint !== null && (
                    <div
                        className="chart-tooltip bg-dark text-white rounded p-2 shadow position-absolute"
                        style={{
                            left: `${(points[hoveredPoint].x / width) * 100}%`,
                            top: `${(points[hoveredPoint].y / height) * 100 - 45}%`,
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none'
                        }}
                    >
                        <div className="fw-bold small">{points[hoveredPoint].label}</div>
                        <div className="small text-info">{points[hoveredPoint].val} Logs Detected</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrendChart;
