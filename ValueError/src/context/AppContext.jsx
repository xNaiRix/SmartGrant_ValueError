import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

// Konfigurasi URL Backend
// Pastikan kamu sudah setting Proxy di package.json jika pakai "/api"
// Atau kembalikan ke "http://localhost:8000" jika tanpa proxy.
const API_URL = "/api";

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data Lists
  const [fundRequests, setFundRequests] = useState([]); // Projects
  const [grantOffers, setGrantOffers] = useState([]); // Grants
  const [applications, setApplications] = useState([]);

  // ============================================================
  // 1. AUTHENTICATION
  // ============================================================

  const fetchCurrentUser = async (token) => {
    try {
      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // PERBAIKAN: Backtick
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user profile");
      const userData = await response.json();
      setUser({ ...userData, token });
      return true;
    } catch (error) {
      console.error("Error fetching current user:", error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await fetchCurrentUser(token);
        // Ambil data awal
        await fetchGrants();
        await fetchProjects();
      }
      setLoading(false);
    };
    initApp();
  }, []);

  // Di dalam AppContext.js, ganti fungsi login dengan ini:

  const login = async (email, password, role) => {
    try {
      console.log("Attempting login for:", email); // Cek apakah fungsi terpanggil

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pastikan backend kamu menerima "role" saat login.
        // Jika backend error 422, coba hapus properti 'role' di sini.
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login Failed Response:", errorData);
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      console.log("Login Success Data:", data);

      // --- PERBAIKAN PENTING DI SINI ---
      // Cek apakah data adalah string langsung ATAU object { access_token: "..." }
      const token = data.access_token || data.token || data;

      if (typeof token !== "string") {
        throw new Error("Invalid token format received from server");
      }

      // Simpan token yang benar
      localStorage.setItem("token", token);

      // Load user profile segera setelah dapat token
      const success = await fetchCurrentUser(token);

      if (success) {
        navigate("/profile"); // Arahkan ke profile atau dashboard
      } else {
        alert("Login successful but failed to load profile.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth");
  };

  const register = async (email, name, password, role) => {
    try {
      const payload = { role, data: { email, password, name } };
      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Register failed");
      alert("Registration successful! Please Login.");
      navigate("/auth");
    } catch (error) {
      console.error("Register Error:", error);
      alert("Registration Failed.");
    }
  };

  // ============================================================
  // 2. PROJECTS (FUND REQUESTS) API
  // ============================================================

  // Get All Projects
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(
        `${API_URL}/requests/projects/list?skip=0&limit=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFundRequests(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Create Project
  const addFundRequest = async (scientist_email, name, description) => {
    try {
      const token = localStorage.getItem("token");
      const payload = { scientist_email, name, description };

      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(`${API_URL}/requests/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to create project");
      }

      await fetchProjects(); // Refresh list
      navigate("/profile");
      alert("Project Created Successfully!");
    } catch (err) {
      console.error("Error adding project:", err);
      alert("Failed to create project: " + err.message);
    }
  };

  // Get Single Project
  const getProjectDetail = async (projectId, grantId) => {
    try {
      const token = localStorage.getItem("token");
      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(
        `${API_URL}/requests/projects/${projectId}?grant_id=${grantId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to get project detail");
      return await response.json();
    } catch (error) {
      console.error("Error fetching project detail:", error);
    }
  };

  // Delete Project
  const deleteProject = async (projectId, grantId) => {
    try {
      const token = localStorage.getItem("token");
      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(
        `${API_URL}/requests/projects/${projectId}?grant_id=${grantId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete project");

      setFundRequests((prev) => prev.filter((item) => item.id !== projectId));
      alert("Project deleted successfully");
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project.");
    }
  };

  // ============================================================
  // 3. GRANTS API
  // ============================================================

  // Get All Grants
  const fetchGrants = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(
        `${API_URL}/requests/grants/list?skip=0&limit=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGrantOffers(data);
      }
    } catch (error) {
      console.error("Failed to fetch grants list", error);
    }
  };

  // Create Grant
  const addGrantOffer = async (scientist_email, name, description) => {
    try {
      const token = localStorage.getItem("token");
      const payload = { scientist_email, name, description };

      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(`${API_URL}/requests/grants/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to add grant");

      await fetchGrants();
      navigate("/profile");
      alert("Grant created successfully!");
    } catch (err) {
      console.error("Error adding grant:", err);
      alert("Failed to create Grant.");
    }
  };

  // --- DELETE GRANT ---
  const deleteGrant = async (grantId) => {
    try {
      const token = localStorage.getItem("token");

      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(`${API_URL}/requests/grants/${grantId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete grant");
      }

      setGrantOffers((prev) => prev.filter((grant) => grant.id !== grantId));

      alert("Grant deleted successfully!");
    } catch (err) {
      console.error("Error deleting grant:", err);
      alert("Failed to delete grant.");
    }
  };

  // ============================================================
  // 4. EXPORT
  // ============================================================

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        fundRequests,
        grantOffers,
        applications,

        // Auth
        register,
        login,
        logout,

        // Projects
        fetchProjects,
        addFundRequest,
        getProjectDetail,
        deleteProject,

        // Grants
        fetchGrants,
        addGrantOffer,
        deleteGrant,
      }}
    >
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
