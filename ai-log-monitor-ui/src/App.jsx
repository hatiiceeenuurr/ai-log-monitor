import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import RagSearch from "./pages/RagSearch";
import Scan from "./pages/Scan";

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="analysis" element={<Analysis />} />
                <Route path="rag" element={<RagSearch />} />
                <Route path="scan" element={<Scan />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;