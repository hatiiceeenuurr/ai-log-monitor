import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <div
            className="bg-dark text-white p-3"
            style={{
                width: "220px",
                minHeight: "100vh",
            }}
        >
            <h3 className="text-center mb-5">Menu</h3>

            <ul className="nav flex-column">

                <li className="nav-item mb-3">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "text-info fw-bold" : "text-white"}`
                        }
                    >
                        Dashboard
                    </NavLink>
                </li>

                <li className="nav-item mb-3">
                    <NavLink
                        to="/analysis"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "text-info fw-bold" : "text-white"}`
                        }
                    >
                        Log Analysis
                    </NavLink>
                </li>

                <li className="nav-item mb-3">
                    <NavLink
                        to="/rag"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "text-info fw-bold" : "text-white"}`
                        }
                    >
                        RAG Search
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink
                        to="/scan"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "text-info fw-bold" : "text-white"}`
                        }
                    >
                        Scan History
                    </NavLink>
                </li>

            </ul>
        </div>
    );
}

export default Sidebar;