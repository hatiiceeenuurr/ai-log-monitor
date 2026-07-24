import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestPasswordResetCode, confirmPasswordReset } from '../services/api';

function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot Password Modal State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
    const [resetEmail, setResetEmail] = useState('');
    const [otpCodeInput, setOtpCodeInput] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [newResetPassword, setNewResetPassword] = useState('');
    const [resetMsg, setResetMsg] = useState({ type: '', text: '' });
    const [resetLoading, setResetLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                if (!username.trim() || !email.trim() || !password.trim()) {
                    setError('Please fill in all required fields (Username, Email, Password).');
                    setLoading(false);
                    return;
                }
                await register(username.trim(), email.trim(), password.trim(), rememberMe);
            } else {
                if (!username.trim() || !password.trim()) {
                    setError('Please enter both your username and password.');
                    setLoading(false);
                    return;
                }
                await login(username.trim(), password.trim(), rememberMe);
            }
            navigate('/');
        } catch (err) {
            console.error("Auth error:", err);
            const serverMsg = err.response?.data?.message;
            if (serverMsg) {
                setError(serverMsg);
            } else if (err.code === "ERR_NETWORK" || !err.response) {
                setError('Server unreachable. Please ensure the backend application (port 8081) is running.');
            } else {
                setError(isRegister ? 'Registration failed. Please check your credentials.' : 'Authentication failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdminLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await login('admin', 'admin123', rememberMe);
            navigate('/');
        } catch (err) {
            console.error("Demo login error:", err);
            const serverMsg = err.response?.data?.message;
            if (serverMsg) {
                setError(`Demo login failed: ${serverMsg}`);
            } else if (err.code === "ERR_NETWORK" || !err.response) {
                setError('Server unreachable. Please ensure the backend application (port 8081) is running.');
            } else {
                setError('Demo login failed. Please ensure the backend application is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setResetMsg({ type: '', text: '' });
        if (!resetEmail.trim()) {
            setResetMsg({ type: 'danger', text: 'Please enter your registered email address or username.' });
            return;
        }

        try {
            setResetLoading(true);
            const res = await requestPasswordResetCode(resetEmail.trim());
            setResetEmail(res.email || resetEmail);
            setResetStep(2);
            setResetMsg({ type: 'success', text: `Verification code sent to ${res.email || resetEmail}. Please check your inbox.` });
        } catch (err) {
            console.error("Request OTP error:", err);
            const msg = err.response?.data?.message || 'Failed to request verification code. Check email address.';
            setResetMsg({ type: 'danger', text: msg });
        } finally {
            setResetLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        setResetMsg({ type: '', text: '' });

        if (!otpCodeInput.trim() || !newResetPassword.trim()) {
            setResetMsg({ type: 'danger', text: 'Please enter the 6-digit OTP code and your new password.' });
            return;
        }

        if (newResetPassword.trim().length < 6) {
            setResetMsg({ type: 'danger', text: 'New password must be at least 6 characters long.' });
            return;
        }

        try {
            setResetLoading(true);
            const res = await confirmPasswordReset(resetEmail, otpCodeInput.trim(), newResetPassword.trim());
            setResetMsg({ type: 'success', text: res.message || 'Password reset successfully! You can now sign in.' });
            setTimeout(() => {
                setShowForgotModal(false);
                setResetStep(1);
                setResetEmail('');
                setOtpCodeInput('');
                setNewResetPassword('');
                setResetMsg({ type: '', text: '' });
            }, 1800);
        } catch (err) {
            console.error("Confirm reset error:", err);
            const msg = err.response?.data?.message || 'Invalid or expired OTP code.';
            setResetMsg({ type: 'danger', text: msg });
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark" 
             style={{
                 background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%)',
                 color: '#f8fafc'
             }}>
            <div className="container" style={{ maxWidth: '440px' }}>
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient rounded-circle mb-3 shadow" style={{ width: '64px', height: '64px' }}>
                        <span className="fs-2 text-white">🤖</span>
                    </div>
                    <h3 className="fw-bold tracking-tight mb-1">AI Log Monitor</h3>
                    <p className="text-secondary small">AI-Powered Log Analysis & Monitoring Platform</p>
                </div>

                <div className="card border-0 shadow-lg rounded-4 text-white" 
                     style={{
                         background: 'rgba(30, 41, 59, 0.75)',
                         backdropFilter: 'blur(16px)',
                         border: '1px solid rgba(255, 255, 255, 0.1)'
                     }}>
                    <div className="card-body p-4">
                        {/* Tab Switcher */}
                        <div className="d-flex bg-dark bg-opacity-50 p-1 rounded-3 mb-4 border border-secondary border-opacity-25">
                            <button 
                                type="button"
                                className={`btn btn-sm w-50 rounded-2 fw-semibold transition-all ${!isRegister ? 'btn-primary shadow' : 'btn-link text-secondary text-decoration-none'}`}
                                onClick={() => { setIsRegister(false); setError(''); }}
                            >
                                Sign In
                            </button>
                            <button 
                                type="button"
                                className={`btn btn-sm w-50 rounded-2 fw-semibold transition-all ${isRegister ? 'btn-primary shadow' : 'btn-link text-secondary text-decoration-none'}`}
                                onClick={() => { setIsRegister(true); setError(''); }}
                            >
                                Sign Up
                            </button>
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 border-0 bg-danger bg-opacity-25 text-danger-emphasis">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label small text-secondary fw-semibold">Username</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white rounded-3 shadow-none" 
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            {isRegister && (
                                <div className="mb-3">
                                    <label className="form-label small text-secondary fw-semibold">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white rounded-3 shadow-none" 
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="mb-2">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small text-secondary fw-semibold mb-0">Password</label>
                                    {!isRegister && (
                                        <button 
                                            type="button" 
                                            className="btn btn-link p-0 text-info small text-decoration-none"
                                            onClick={() => { setShowForgotModal(true); setResetStep(1); setResetMsg({ type: '', text: '' }); }}
                                        >
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="input-group">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white rounded-start-3 shadow-none border-end-0" 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary border-secondary border-opacity-25 text-secondary rounded-end-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me Option */}
                            <div className="form-check mb-4 mt-3">
                                <input 
                                    className="form-check-input shadow-none" 
                                    type="checkbox" 
                                    id="rememberMeCheck" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="form-check-label small text-secondary" htmlFor="rememberMeCheck">
                                    Remember me (Keep session active on this device)
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary bg-gradient w-100 py-2 rounded-3 fw-bold shadow-sm mb-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                ) : isRegister ? 'Create Account & Sign In' : 'Sign In'}
                            </button>
                        </form>

                        {!isRegister && (
                            <>
                                <div className="text-center my-3 position-relative">
                                    <hr className="border-secondary opacity-25" />
                                    <span className="position-absolute top-50 start-50 translate-middle bg-dark px-2 text-secondary small">or</span>
                                </div>

                                <button 
                                    type="button"
                                    className="btn btn-outline-info w-100 py-2 rounded-3 fw-semibold btn-sm"
                                    onClick={handleQuickAdminLogin}
                                    disabled={loading}
                                >
                                    🚀 One-Click Admin Demo Login (admin / admin123)
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-center text-secondary small mt-4">
                    AI Log Monitor System &copy; 2026
                </p>
            </div>

            {/* Forgot Password OTP Modal */}
            {showForgotModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
                        <div className="modal-content shadow-lg border-0 rounded-4 bg-dark text-white border border-secondary border-opacity-25">
                            <div className="modal-header border-bottom border-secondary border-opacity-25 p-3">
                                <h5 className="modal-title fw-bold text-white fs-6">🔒 Password Reset & OTP Verification</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForgotModal(false)}></button>
                            </div>

                            <div className="modal-body p-4">
                                {resetMsg.text && (
                                    <div className={`alert alert-${resetMsg.type} rounded-3 py-2 px-3 small mb-3 border-0`}>
                                        {resetMsg.text}
                                    </div>
                                )}

                                {resetStep === 1 ? (
                                    <form onSubmit={handleRequestOtp}>
                                        <p className="text-secondary small mb-3">
                                            Enter your registered email address or username. We will generate a 6-digit verification code (OTP) to prove account ownership.
                                        </p>

                                        <div className="mb-4">
                                            <label className="form-label small text-secondary fw-semibold">Email or Username</label>
                                            <input 
                                                type="text" 
                                                className="form-control bg-dark bg-opacity-50 border-secondary text-white rounded-3 shadow-none" 
                                                placeholder="admin@teknokent.com or admin"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-secondary btn-sm rounded-pill px-3" onClick={() => setShowForgotModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold" disabled={resetLoading}>
                                                {resetLoading ? 'Sending...' : 'Send Verification Code 📩'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleConfirmReset}>
                                        <p className="text-secondary small mb-3">
                                            Enter the 6-digit OTP code sent to <strong>{resetEmail}</strong> and your new password.
                                        </p>

                                        <div className="mb-3">
                                            <label className="form-label small text-secondary fw-semibold">6-Digit OTP Code</label>
                                            <input 
                                                type="text" 
                                                className="form-control bg-dark bg-opacity-50 border-secondary text-white rounded-3 shadow-none font-monospace text-center fs-4 letter-spacing-2" 
                                                placeholder="000000"
                                                maxLength={6}
                                                value={otpCodeInput}
                                                onChange={(e) => setOtpCodeInput(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label small text-secondary fw-semibold">New Password</label>
                                            <input 
                                                type="password" 
                                                className="form-control bg-dark bg-opacity-50 border-secondary text-white rounded-3 shadow-none" 
                                                placeholder="Enter new password (min 6 chars)"
                                                value={newResetPassword}
                                                onChange={(e) => setNewResetPassword(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <button type="button" className="btn btn-link text-secondary btn-sm p-0 text-decoration-none" onClick={() => setResetStep(1)}>
                                                &laquo; Back
                                            </button>
                                            <div className="d-flex gap-2">
                                                <button type="button" className="btn btn-secondary btn-sm rounded-pill px-3" onClick={() => setShowForgotModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-success btn-sm rounded-pill px-4 fw-bold" disabled={resetLoading}>
                                                    {resetLoading ? 'Resetting...' : 'Reset Password 🔒'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;
