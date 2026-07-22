import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                await register(username.trim(), email.trim(), password.trim());
            } else {
                if (!username.trim() || !password.trim()) {
                    setError('Please enter both your username and password.');
                    setLoading(false);
                    return;
                }
                await login(username.trim(), password.trim());
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
            await login('admin', 'admin123');
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

                            <div className="mb-4">
                                <label className="form-label small text-secondary fw-semibold">Password</label>
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

                            <button 
                                type="submit" 
                                className="btn btn-primary bg-gradient w-100 py-2 rounded-3 fw-bold shadow-sm mb-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                ) : isRegister ? 'Create Account' : 'Sign In'}
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
        </div>
    );
}

export default Login;
