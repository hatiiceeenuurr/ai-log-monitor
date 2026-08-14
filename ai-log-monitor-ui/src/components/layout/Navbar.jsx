import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import HealthBar from "../common/HealthBar";
import { requestNotificationPermission, sendDesktopNotification } from "../../utils/notificationUtils";
import { useTranslation } from "react-i18next";

function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [notifGranted, setNotifGranted] = useState(() => 'Notification' in window && Notification.permission === 'granted');
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        // Trigger Google Translate widget for dynamic content translation
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = lng;
            select.dispatchEvent(new Event('change'));
        }
    };

    const handleEnableNotif = async () => {
        if (!('Notification' in window)) {
            alert("This browser does not support desktop notifications.");
            return;
        }

        if (Notification.permission === 'granted') {
            setNotifGranted(true);
            alert(language === 'tr' ? "Masaüstü bildirimleri ZATEN AKTİF! 🔔\n\nTarayıcınız bildirimlere izin vermiş. Kritik hatalarda Windows masaüstü bildirimi açılacaktır." : "Desktop notifications are ALREADY ACTIVE! 🔔\n\nYour browser has already allowed notifications. Windows will pop up desktop alerts for critical log incidents.");
            sendDesktopNotification("AI Log Monitor Alerts Active 🔔", "Windows desktop notifications are active and ready.");
            return;
        }

        if (Notification.permission === 'denied') {
            alert(language === 'tr' ? "Masaüstü bildirimleri tarayıcınız tarafından engellenmiş.\n\nLütfen http://localhost:5173 yanındaki ⓘ veya Kilit simgesine tıklayıp Bildirimleri 'İzin Ver' yapın." : "Desktop notifications are blocked by your browser settings for localhost.\n\nPlease click the Lock 🔒 icon next to http://localhost:5173 in your browser URL bar and set Notifications to 'Allow'.");
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
            <nav className="navbar navbar-expand-lg border-bottom px-3 shadow-sm" translate="no">
                <div className="container-fluid">
                    <span 
                        className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <span className="fs-3">🤖</span>
                        <span className="bg-gradient bg-primary text-white px-2 py-1 rounded-3">{t("navbar.title")}</span>
                    </span>

                    <HealthBar />

                    <div className="d-flex align-items-center gap-2 gap-sm-3 ms-auto">
                        <button
                            className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1 ${notifGranted ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            onClick={handleEnableNotif}
                            title={notifGranted ? t('alertsActive') : t('enableAlerts')}
                        >
                            <span>🔔</span>
                            <span className="d-none d-md-inline fw-semibold">{notifGranted ? t('dashboard.alerts_active') : t('dashboard.enable_alerts')}</span>
                        </button>

                        <button
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                        >
                            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                            <span className="d-none d-sm-inline fw-semibold">{theme === 'dark' ? t('navbar.light') : t('navbar.dark')}</span>
                        </button>

                        <div className="btn-group" role="group">
                            <button 
                                type="button" 
                                className={`btn btn-sm ${i18n.language === 'tr' ? 'btn-primary' : 'btn-outline-primary'}`} 
                                onClick={() => changeLanguage('tr')}
                            >
                                TR
                            </button>
                            <button 
                                type="button" 
                                className={`btn btn-sm ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-primary'}`} 
                                onClick={() => changeLanguage('en')}
                                translate="no"
                            >
                                EN
                            </button>
                        </div>

                        {user && (
                            <div 
                                className="d-flex align-items-center gap-2 bg-secondary bg-opacity-25 px-3 py-1 rounded-pill border border-secondary border-opacity-50"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/settings')}
                                title="Profile & Settings"
                            >
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="fw-semibold small" style={{ color: 'var(--bs-heading-color)' }}>{user.username}</span>
                                <span className="badge bg-danger text-uppercase ms-1" style={{ fontSize: '10px' }}>
                                    {user.role || 'ADMIN'}
                                </span>
                            </div>
                        )}


                        <button 
                            className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <span>🚪</span> {t('sidebar.logout')}
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
                                <h5 className="modal-title fw-bold text-white fs-6">{t('auth.logout_confirm_title')}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowLogoutModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <div className="display-4 text-warning mb-3">⚠️</div>
                                <h6 className="fw-bold mb-2" style={{ color: 'var(--text-main)' }}>{t('auth.logout_confirm_desc')}</h6>
                                <p className="text-muted small mb-0">{t('auth.logout_confirm_sub')}</p>
                            </div>
                            <div className="modal-footer border-top-0 d-flex justify-content-center gap-2 pb-4">
                                <button type="button" className="btn btn-secondary px-4 rounded-pill fw-semibold" onClick={() => setShowLogoutModal(false)}>
                                    {t('auth.cancel')}
                                </button>
                                <button type="button" className="btn btn-danger px-4 rounded-pill fw-bold" onClick={handleConfirmLogout}>
                                    {t('auth.logout_yes')}
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