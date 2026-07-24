import { useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { Outlet } from "react-router-dom";

function MainLayout() {
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Standard browser prompt when leaving/refreshing active monitoring session
            e.preventDefault();
            e.returnValue = "Are you sure you want to leave or refresh? Active monitoring logs are running.";
            return e.returnValue;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

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