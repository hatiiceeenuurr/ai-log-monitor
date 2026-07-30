import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Sidebar() {
    const { t } = useTranslation();
    return (
        <div
            className="sidebar-nav p-3"
            style={{
                width: "220px",
                minHeight: "100vh",
            }}
            translate="no"
        >
            <div className="text-center mb-4 pt-2 border-bottom border-secondary border-opacity-25 pb-3">
                <h6 className="text-uppercase fw-bold mb-0 opacity-75" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Navigation</h6>
            </div>

            <ul className="nav flex-column gap-2">

                <li className="nav-item">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 ${isActive ? "active" : ""}`
                        }
                    >
                        📊 {t("sidebar.dashboard")}
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink
                        to="/analysis"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 ${isActive ? "active" : ""}`
                        }
                    >
                        📋 {t("sidebar.analysis")}
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink
                        to="/rag"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 ${isActive ? "active" : ""}`
                        }
                    >
                        🔍 {t("sidebar.rag")}
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink
                        to="/scan"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 ${isActive ? "active" : ""}`
                        }
                    >
                        ⚡ {t("sidebar.scan")}
                    </NavLink>
                </li>

                <li className="nav-item mt-2 pt-2 border-top border-secondary border-opacity-25">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `nav-link rounded-3 px-3 py-2 ${isActive ? "active" : ""}`
                        }
                    >
                        ⚙️ {t("sidebar.settings")}
                    </NavLink>
                </li>

            </ul>
        </div>
    );
}

export default Sidebar;