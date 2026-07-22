import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import { Outlet } from "react-router-dom";

function MainLayout() {
    return (
        <>
            <Navbar />

            <div className="d-flex">

                <Sidebar />

                <div className="flex-grow-1">
                    <Outlet />
                </div>

            </div>
        </>
    );
}

export default MainLayout;