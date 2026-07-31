import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword, getSettings, updateSettings } from '../services/api';
import { useTranslation } from 'react-i18next';

function Settings() {
    const { user } = useAuth();
    const { t } = useTranslation();

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const [slackEnabled, setSlackEnabled] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [slackMsg, setSlackMsg] = useState({ type: '', text: '' });
    const [savingSlack, setSavingSlack] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await getSettings();
                if (settings) {
                    setSlackEnabled(settings['slack_enabled'] === 'true');
                    setWebhookUrl(settings['slack_webhook_url'] || '');
                }
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMsg({ type: '', text: '' });

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMsg({ type: 'danger', text: t('settings.fill_all_fields') });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'danger', text: t('settings.passwords_not_match') });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMsg({ type: 'danger', text: t('settings.password_too_short') });
            return;
        }

        try {
            setUpdatingPassword(true);
            const res = await changePassword(currentPassword, newPassword);
            setPasswordMsg({ type: 'success', text: res.message || t('settings.password_updated') });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Password update error:", err);
            const errMsg = err.response?.data?.message || t('settings.password_update_failed');
            setPasswordMsg({ type: 'danger', text: errMsg });
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleSaveSlack = async () => {
        setSavingSlack(true);
        setSlackMsg({ type: '', text: '' });
        try {
            await updateSettings({
                'slack_enabled': slackEnabled.toString(),
                'slack_webhook_url': webhookUrl
            });
            setSlackMsg({ type: 'success', text: t('settings.slack_webhook_success') });
        } catch (err) {
            setSlackMsg({ type: 'danger', text: t('settings.slack_webhook_failed') });
        } finally {
            setSavingSlack(false);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">{t('settings.title')}</h2>
                <p className="text-muted small mb-0">{t('settings.subtitle')}</p>
            </div>

            <div className="row g-4">
                {/* Left Column: Profile Credentials & Security */}
                <div className="col-lg-6">
                    {/* User Profile Info Card */}
                    <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-3">{t('settings.profile_details')}</h5>
                        <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                            <div className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 shadow" style={{ width: '64px', height: '64px' }}>
                                {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                                <h5 className="fw-bold mb-1">{user?.username || 'admin'}</h5>
                                <span className="badge bg-danger text-uppercase px-3 py-1">
                                    {user?.role || 'ADMINISTRATOR'}
                                </span>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">{t('settings.username')}</label>
                                <div className="p-2 bg-body-tertiary rounded-3 fw-semibold border">
                                    {user?.username || 'admin'}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">{t('settings.email')}</label>
                                <div className="p-2 bg-body-tertiary rounded-3 fw-semibold border">
                                    {user?.email || 'admin@teknokent.com'}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">{t('settings.account_status')}</label>
                                <div className="p-2 bg-body-tertiary rounded-3 fw-semibold text-success border">
                                    {t('settings.active_verified')}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">{t('settings.password_protection')}</label>
                                <div className="p-2 bg-body-tertiary rounded-3 fw-semibold border">
                                    {t('settings.bcrypt_hashed')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card (Connected to Real Backend) */}
                    <div className="card shadow-sm border-0 rounded-4 p-4">
                        <h5 className="fw-bold mb-3">{t('settings.security_update')}</h5>
                        
                        {passwordMsg.text && (
                            <div className={`alert alert-${passwordMsg.type} rounded-3 py-2 px-3 small mb-3`}>
                                {passwordMsg.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange}>
                            <div className="mb-3">
                                <label className="form-label small text-muted fw-bold">{t('settings.current_password')}</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    placeholder="••••••••"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label small text-muted fw-bold">{t('settings.new_password')}</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    placeholder={t('settings.new_password_placeholder')}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label small text-muted fw-bold">{t('settings.confirm_password')}</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    placeholder={t('settings.reenter_password_placeholder')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary bg-gradient px-4 rounded-pill fw-bold shadow-sm"
                                disabled={updatingPassword}
                            >
                                {updatingPassword ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {t('settings.updating_password')}
                                    </>
                                ) : t('settings.update_password_btn')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Real Slack Incident Webhook Integration */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                        <h5 className="fw-bold mb-3">{t('settings.slack_integration')}</h5>
                        <p className="text-muted small mb-4">
                            {t('settings.slack_desc')}
                        </p>

                        {slackMsg.text && (
                            <div className={`alert alert-${slackMsg.type} rounded-3 py-2 px-3 small mb-4`}>
                                {slackMsg.text}
                            </div>
                        )}

                        <div className="mb-4 p-3 bg-body-tertiary rounded-3 border">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <h6 className="fw-bold mb-0">{t('settings.slack_alert_status')}</h6>
                                </div>
                                <div className="form-check form-switch fs-4">
                                    <input 
                                        className="form-check-input shadow-none" 
                                        type="checkbox" 
                                        role="switch"
                                        checked={slackEnabled}
                                        onChange={(e) => setSlackEnabled(e.target.checked)}
                                    />
                                </div>
                            </div>
                            <span className={`badge ${slackEnabled ? 'bg-success' : 'bg-secondary'}`} translate="no">
                                {slackEnabled ? t('settings.slack_active') : t('settings.slack_disabled')}
                            </span>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small text-muted fw-bold">{t('settings.slack_webhook_url_label')}</label>
                            <input 
                                type="text" 
                                className="form-control font-monospace small" 
                                placeholder={t('settings.slack_webhook_placeholder')}
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                            <small className="text-muted d-block mt-1">
                                {t('settings.slack_webhook_helper')}
                            </small>
                        </div>

                        <div className="mt-auto pt-3 border-top">
                            <button 
                                className="btn btn-outline-primary px-4 rounded-pill fw-bold"
                                onClick={handleSaveSlack}
                                disabled={savingSlack}
                            >
                                {savingSlack ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {t('settings.saving_slack')}
                                    </>
                                ) : t('settings.save_slack_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
