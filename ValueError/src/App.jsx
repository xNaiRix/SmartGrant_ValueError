import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
// 1. IMPORT HALAMAN SCAN QR
import QRPage from "./pages/QRPage";

// Komponen pelindung untuk rute private
const PrivateRoute = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/auth" />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreatePost />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* 2. DAFTARKAN ROUTE SCAN QR DISINI */}
        {/* Kita masukkan ke PrivateRoute biar cuma user login yg bisa akses */}
        <Route
          path="/scan-qr"
          element={
            <PrivateRoute>
              <QRPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Router>
  );
}
