import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { clearToken, setToken } from "../api/client.js";

function getCookie(name) {
  const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
  return v ? v[2] : null;
}

export function useAuth() {
  const [token, setTokenState] = useState(() => {
    const ls = localStorage.getItem("token");
    const cookie = getCookie("auth_token");
    // Prefer localStorage; if none but cookie exists, use cookie
    return ls || cookie;
  });
  const [user, setUser] = useState(null);
  const isAuthed = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    const onStorage = () => setTokenState(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Auto-login from cookie on first mount if no localStorage token
  useEffect(() => {
    const cookie = getCookie("auth_token");
    if (cookie && !localStorage.getItem("token")) {
      setToken(cookie);
      setTokenState(cookie);
    }
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        if (!mounted) return;
        setUser(res.data?.user || null);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadMe();
    return () => {
      mounted = false;
    };
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  return { token, user, isAuthed, isLoading, login, logout };
}

