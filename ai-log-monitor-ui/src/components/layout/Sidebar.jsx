import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <div
            className="bg-dark text-white p-3 border-end border-secondary border-opacity-25"
            style={{
                width: "220px",
                minHeight: "100vh",
            }}
        >
            <div className="text-center mb-4 pt-2 border-bottom border-secondary border-opacity-25 pb-3">
                <h6 className="text-white text-uppercase tracking-wider fw-bold mb-0 opacity-75">Navigation</h6>
            </div>

            <ul className="nav flex-column gap-2">

                <li className="nav-item">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 transition-all ${isActive ? "bg-primary text-white fw-bold shadow-sm" : "text-light opacity-75 hover-opacity-100"}`
                        }
                    >
                        📊 Dashboard
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink
                        to="/analysis"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 transition-all ${isActive ? "bg-primary text-white fw-bold shadow-sm" : "text-light opacity-75 hover-opacity-100"}`
                        }
                    >
                        📋 Log Analysis
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink
                        to="/rag"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 transition-all ${isActive ? "bg-primary text-white fw-bold shadow-sm" : "text-light opacity-75 hover-opacity-100"}`
                        }
                    >
                        🔍 RAG Search
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink
                        to="/scan"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 transition-all ${isActive ? "bg-primary text-white fw-bold shadow-sm" : "text-light opacity-75 hover-opacity-100"}`
                        }
                    >
                        ⚡ Scan History
                    </NavLink>
                </li>

                <li className="nav-item mt-2 pt-2 border-top border-secondary border-opacity-25">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 transition-all ${isActive ? "bg-primary text-white fw-bold shadow-sm" : "text-light opacity-75 hover-opacity-100"}`
                        }
                    >
                        ⚙️ Settings
                    </NavLink>
                </li>

            </ul>
        </div>
    );
}

export default Sidebar;