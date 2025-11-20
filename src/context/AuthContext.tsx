// src/context/AuthContext.tsx
import React from "react";
import type { LoginResponse } from "../Services/auth.service";

type BackendDecimal = { $numberDecimal: string };

// BackendUser is not exported from the service file, define a local type matching the backend shape we use.
type BackendUser = {
  id: string;
  name: string;
  email: string;
  role_id: string;
  currency_id: string;
  balance?: number | BackendDecimal;
  frozen_balance?: number | BackendDecimal;
};

type AuthUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  currencyId: string;
  balance: number;
  frozenBalance: number;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  initialized: boolean; // para saber si ya leímos localStorage
  login: (data: LoginResponse) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const toNumber = (v: number | BackendDecimal | undefined): number => {
  if (typeof v === "number") return v;
  if (v && typeof (v as BackendDecimal).$numberDecimal === "string") {
    const n = Number((v as BackendDecimal).$numberDecimal);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const mapBackendUser = (u: BackendUser): AuthUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  roleId: u.role_id,
  currencyId: u.currency_id,
  balance: toNumber(u.balance),
  frozenBalance: toNumber(u.frozen_balance),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [initialized, setInitialized] = React.useState(false);

  // Leer de localStorage al inicio
  React.useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as BackendUser;
        setUser(mapBackendUser(parsed));
        setToken(storedToken);
      } catch (e) {
        console.error("Error parseando user de localStorage:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setInitialized(true);
  }, []);

  const login = (data: LoginResponse) => {
    const mapped = mapBackendUser(data.user);
    setUser(mapped);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user)); // guardamos el original del back
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    initialized,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 👇 Hook que usarás en cualquier parte del app
export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return ctx;
};
