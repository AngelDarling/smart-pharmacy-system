import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  function logout() {
    localStorage.setItem("flash", "logout_success");
    localStorage.removeItem("token");
    window.location.href = "/admin/login";
  }

  return { user, loading, logout, refreshUser: fetchUser };
}


