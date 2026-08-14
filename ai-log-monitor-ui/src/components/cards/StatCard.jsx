import { useState, useEffect } from 'react';

function StatCard({ title, value, color, icon, onClick }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10);
        if (isNaN(end)) {
            setDisplayValue(value);
            return;
        }
        
        const duration = 1000; // 1 second animation
        const incrementTime = 20; 
        const step = Math.max(1, Math.ceil(end / (duration / incrementTime)));

        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(start);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="col mb-4">
            <div 
                className={`card border-0 shadow-sm bg-${color} text-white h-100 stat-card-hover`}
                onClick={onClick}
                style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s' }}
            >
                <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                    {icon && <i className={`bi ${icon} fs-1 mb-2 opacity-75`}></i>}
                    <h5 className="card-title fw-bold small text-uppercase opacity-75 mb-1" translate="no">
                        {title}
                    </h5>
                    <h1 className="display-5 fw-bold mb-0">
                        {displayValue}
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default StatCard;