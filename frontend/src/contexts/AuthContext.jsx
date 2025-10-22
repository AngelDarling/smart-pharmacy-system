import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (phone, password) => {
    try {
      const response = await api.post("/auth/login", { phone, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem("token", token);
      
      // Force state update với callback để đảm bảo re-render
      setUser(prevUser => {
        console.log('AuthContext login: setting user from', prevUser, 'to', userData);
        return userData;
      });
      
      // Trigger refresh để force re-render
      setRefreshTrigger(prev => prev + 1);
      
      setLoading(false);
      console.log('AuthContext login: user set to:', userData);
      return userData;
    } catch (error) {
      setLoading(false);
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  }, []);

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  function logout() {
    localStorage.setItem("flash", "logout_success");
    localStorage.removeItem("token");
    setUser(null);
    setRefreshTrigger(prev => prev + 1);
    // Redirect based on current location
    if (window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/";
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: fetchUser,
    refreshTrigger
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
