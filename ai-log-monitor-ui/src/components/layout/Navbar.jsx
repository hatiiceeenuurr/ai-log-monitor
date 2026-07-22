import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary border-opacity-25 px-3 shadow-sm">
            <div className="container-fluid">
                <span className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2">
                    <span className="fs-3">🤖</span>
                    <span className="bg-gradient bg-primary text-white px-2 py-1 rounded-3">AI Log Monitor</span>
                </span>

                <div className="d-flex align-items-center gap-3 ms-auto">
                    {user && (
                        <div className="d-flex align-items-center gap-2 bg-secondary bg-opacity-25 px-3 py-1 rounded-pill border border-secondary border-opacity-50">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="text-white fw-semibold small">{user.username}</span>
                            <span className="badge bg-danger text-uppercase ms-1" style={{ fontSize: '10px' }}>
                                {user.role || 'ADMIN'}
                            </span>
                        </div>
                    )}

                    <button 
                        className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                        onClick={handleLogout}
                    >
                        <span>🚪</span> Çıkış Yap
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;