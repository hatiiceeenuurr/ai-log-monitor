import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import HealthBar from "../common/HealthBar";
import { requestNotificationPermission, sendDesktopNotification } from "../../utils/notificationUtils";

function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [notifGranted, setNotifGranted] = useState(() => 'Notification' in window && Notification.permission === 'granted');

    const handleEnableNotif = async () => {
        if (!('Notification' in window)) {
            alert("This browser does not support desktop notifications.");
            return;
        }

        if (Notification.permission === 'granted') {
            setNotifGranted(true);
            alert("Desktop notifications are ALREADY ACTIVE! 🔔\n\nYour browser has already allowed notifications. Windows will pop up desktop alerts for critical log incidents.");
            sendDesktopNotification("AI Log Monitor Alerts Active 🔔", "Windows desktop notifications are active and ready.");
            return;
        }

        if (Notification.permission === 'denied') {
            alert("Desktop notifications are blocked by your browser settings for localhost.\n\nPlease click the Lock 🔒 icon next to http://localhost:5173 in your browser URL bar and set Notifications to 'Allow'.");
            return;
        }

        const granted = await requestNotificationPermission();
        setNotifGranted(granted);
        if (granted) {
            sendDesktopNotification("AI Log Monitor Alerts Active 🔔", "You will receive native Windows desktop notifications for critical log incidents.");
        }
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate("/login");
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg border-bottom px-3 shadow-sm">
                <div className="container-fluid">
                    <span 
                        className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <span className="fs-3">🤖</span>
                        <span className="bg-gradient bg-primary text-white px-2 py-1 rounded-3">AI Log Monitor</span>
                    </span>

                    <HealthBar />

                    <div className="d-flex align-items-center gap-2 gap-sm-3 ms-auto">
                        <button
                            className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1 ${notifGranted ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            onClick={handleEnableNotif}
                            title={notifGranted ? "Desktop notifications active" : "Click to enable Windows Desktop Alerts"}
                        >
                            <span>🔔</span>
                            <span className="d-none d-md-inline fw-semibold">{notifGranted ? 'Alerts Active' : 'Enable Alerts'}</span>
                        </button>

                        <button
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                        >
                            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                            <span className="d-none d-sm-inline fw-semibold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>

                        {user && (
                            <div 
                                className="d-flex align-items-center gap-2 bg-secondary bg-opacity-25 px-3 py-1 rounded-pill border border-secondary border-opacity-50"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/settings')}
                                title="Click to view Profile & Settings"
                            >
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="fw-semibold small text-body">{user.username}</span>
                                <span className="badge bg-danger text-uppercase ms-1" style={{ fontSize: '10px' }}>
                                    {user.role || 'ADMIN'}
                                </span>
                            </div>
                        )}

                        <button 
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                            onClick={() => navigate('/settings')}
                            title="Settings"
                        >
                            <span>⚙️</span> <span className="d-none d-sm-inline">Settings</span>
                        </button>

                        <button 
                            className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
                        <div className="modal-content shadow-lg border-0 rounded-4">
                            <div className="modal-header bg-dark text-white rounded-top-4 border-bottom border-secondary border-opacity-25">
                                <h5 className="modal-title fw-bold text-white fs-6">Confirm Logout</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowLogoutModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <div className="display-4 text-warning mb-3">⚠️</div>
                                <h6 className="fw-bold text-dark mb-2">Are you sure you want to log out?</h6>
                                <p className="text-muted small mb-0">Your active monitoring session will be ended on this device.</p>
                            </div>
                            <div className="modal-footer border-top-0 d-flex justify-content-center gap-2 pb-4">
                                <button type="button" className="btn btn-secondary px-4 rounded-pill fw-semibold" onClick={() => setShowLogoutModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger px-4 rounded-pill fw-bold" onClick={handleConfirmLogout}>
                                    Yes, Logout 🚪
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;