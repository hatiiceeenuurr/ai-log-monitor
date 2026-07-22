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
                if (!email) {
                    setError('Lütfen e-posta adresinizi giriniz.');
                    setLoading(false);
                    return;
                }
                await register(username, email, password);
            } else {
                await login(username, password);
            }
            navigate('/');
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.response?.data?.message || 'Giriş işlemi başarısız. Lütfen bilgilerinizi kontrol edin.');
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
            setError('Demo giriş başarısız. Varsayılan admin hesabı oluşturulamamış olabilir.');
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
                    <p className="text-secondary small">Yapay Zeka Destekli Log Analiz ve İzleme Platformu</p>
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
                                Giriş Yap
                            </button>
                            <button 
                                type="button"
                                className={`btn btn-sm w-50 rounded-2 fw-semibold transition-all ${isRegister ? 'btn-primary shadow' : 'btn-link text-secondary text-decoration-none'}`}
                                onClick={() => { setIsRegister(true); setError(''); }}
                            >
                                Kayıt Ol
                            </button>
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 border-0 bg-danger bg-opacity-25 text-danger-emphasis">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label small text-secondary fw-semibold">Kullanıcı Adı</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white rounded-3 shadow-none" 
                                    placeholder="Kullanıcı adınız"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            {isRegister && (
                                <div className="mb-3">
                                    <label className="form-label small text-secondary fw-semibold">E-posta Adresi</label>
                                    <input 
                                        type="email" 
                                        className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white rounded-3 shadow-none" 
                                        placeholder="ornek@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="form-label small text-secondary fw-semibold">Şifre</label>
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
                                ) : isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
                            </button>
                        </form>

                        {!isRegister && (
                            <>
                                <div className="text-center my-3 position-relative">
                                    <hr className="border-secondary opacity-25" />
                                    <span className="position-absolute top-50 start-50 translate-middle bg-dark px-2 text-secondary small">veya</span>
                                </div>

                                <button 
                                    type="button"
                                    className="btn btn-outline-info w-100 py-2 rounded-3 fw-semibold btn-sm"
                                    onClick={handleQuickAdminLogin}
                                    disabled={loading}
                                >
                                    🚀 Tek Tıkla Admin Girişi (admin / admin123)
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
