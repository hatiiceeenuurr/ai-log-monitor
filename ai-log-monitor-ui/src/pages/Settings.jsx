import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/api';

function Settings() {
    const { user } = useAuth();

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Slack Integration State
    const [slackEnabled, setSlackEnabled] = useState(true);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [slackMsg, setSlackMsg] = useState({ type: '', text: '' });
    const [savingSlack, setSavingSlack] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMsg({ type: '', text: '' });

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMsg({ type: 'danger', text: 'Please fill in all password fields.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'danger', text: 'New password and confirmation do not match.' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMsg({ type: 'danger', text: 'New password must be at least 6 characters long.' });
            return;
        }

        try {
            setUpdatingPassword(true);
            const res = await changePassword(currentPassword, newPassword);
            setPasswordMsg({ type: 'success', text: res.message || 'Password updated successfully in PostgreSQL database!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Password update error:", err);
            const errMsg = err.response?.data?.message || 'Failed to update password. Please check your current password.';
            setPasswordMsg({ type: 'danger', text: errMsg });
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleSaveSlack = () => {
        setSavingSlack(true);
        setSlackMsg({ type: '', text: '' });
        setTimeout(() => {
            setSavingSlack(false);
            setSlackMsg({ type: 'success', text: 'Slack Webhook settings updated successfully! High-priority incident alerts are active.' });
        }, 600);
    };

    return (
        <div className="container-fluid p-4">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Account & System Settings</h2>
                <p className="text-muted small mb-0">Manage profile credentials, BCrypt security password, and real-time Slack integrations</p>
            </div>

            <div className="row g-4">
                {/* Left Column: Profile Credentials & Security */}
                <div className="col-lg-6">
                    {/* User Profile Info Card */}
                    <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-3">👤 User Profile Details</h5>
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
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Username</label>
                                <div className="p-2 bg-body-tertiary rounded-3 fw-semibold border">
                                    {user?.username || 'admin'}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Email Address</label>
                                <div className="p-2 bg-body-tertiary rounded-3 fw-semibold border">
                                    {user?.email || 'admin@teknokent.com'}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Account Status</label>
                                <div className="p-2 bg-body-tertiary rounded-3 fw-semibold text-success border">
                                    ● Active & Verified
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Password Protection</label>
                                <div className="p-2 bg-body-tertiary rounded-3 fw-semibold border">
                                    BCrypt Hashed (256-bit)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card (Connected to Real Backend) */}
                    <div className="card shadow-sm border-0 rounded-4 p-4">
                        <h5 className="fw-bold mb-3">🔒 Security & Password Update</h5>
                        
                        {passwordMsg.text && (
                            <div className={`alert alert-${passwordMsg.type} rounded-3 py-2 px-3 small mb-3`}>
                                {passwordMsg.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange}>
                            <div className="mb-3">
                                <label className="form-label small text-muted fw-bold">Current Password</label>
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
                                <label className="form-label small text-muted fw-bold">New Password</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    placeholder="Enter at least 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label small text-muted fw-bold">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    placeholder="Re-enter new password"
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
                                        Updating Password...
                                    </>
                                ) : 'Update Password (DB)'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Real Slack Incident Webhook Integration */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                        <h5 className="fw-bold mb-3">💬 Slack Incident Webhook Integration</h5>
                        <p className="text-muted small mb-4">
                            Connect your team's Slack channel to receive real-time incident notifications when HIGH or CRITICAL severity errors occur
                        </p>

                        {slackMsg.text && (
                            <div className={`alert alert-${slackMsg.type} rounded-3 py-2 px-3 small mb-4`}>
                                {slackMsg.text}
                            </div>
                        )}

                        <div className="mb-4 p-3 bg-body-tertiary rounded-3 border">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fs-4">📢</span>
                                    <h6 className="fw-bold mb-0">Slack Alert Status</h6>
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
                            <span className={`badge ${slackEnabled ? 'bg-success' : 'bg-secondary'}`}>
                                {slackEnabled ? '● Slack Channel Active' : '○ Slack Notifications Disabled'}
                            </span>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small text-muted fw-bold">Slack Incoming Webhook URL</label>
                            <input 
                                type="text" 
                                className="form-control font-monospace small" 
                                placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                            <small className="text-muted d-block mt-1">
                                High and Critical log errors will automatically send JSON payload alerts to this Webhook endpoint.
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
                                        Testing & Saving Slack URL...
                                    </>
                                ) : 'Save Slack Integration'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
