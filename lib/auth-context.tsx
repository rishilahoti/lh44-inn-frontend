"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

type AuthContextType = {
  token: string | null;
  setToken: (t: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  adminSignup: (email: string, password: string, name: string, adminInviteCode: string) => Promise<void>;
  logout: () => void;
  isReady: boolean;
  roles: string[];
  isAdmin: boolean;
  rolesChecked: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

type ProfileResponse = { roles?: string[] };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [rolesChecked, setRolesChecked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (!t) setRoles([]);
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem("accessToken", t);
      else localStorage.removeItem("accessToken");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTokenState(localStorage.getItem("accessToken"));
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!token || !isReady) {
      if (!token) setRolesChecked(false);
      return;
    }
    api<ProfileResponse>("/users/profile", { token })
      .then((profile) => {
        const r = profile?.roles;
        setRoles(Array.isArray(r) ? r : []);
      })
      .catch(() => setRoles([]))
      .finally(() => setRolesChecked(true));
  }, [token, isReady]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${getBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = json as { error?: { message?: string }; message?: string };
      throw new Error(err.error?.message ?? err.message ?? "Login failed");
    }
    const payload = (json as { data?: { accessToken: string } }).data ?? json;
    const accessToken = (payload as { accessToken: string }).accessToken;
    if (!accessToken) throw new Error("No token in response");
    setToken(accessToken);
  }, [setToken]);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch(`${getBaseUrl()}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = json as { error?: { message?: string }; message?: string };
      throw new Error(err.error?.message ?? err.message ?? "Signup failed");
    }
  }, []);

  const adminSignup = useCallback(async (email: string, password: string, name: string, adminInviteCode: string) => {
    const res = await fetch(`${getBaseUrl()}/auth/admin-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, adminInviteCode }),
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = json as { error?: { message?: string }; message?: string };
      throw new Error(err.error?.message ?? err.message ?? "Admin signup failed");
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const isAdmin = roles.includes("HOTEL_MANAGER");

  return (
    <AuthContext.Provider value={{ token, setToken, login, signup, adminSignup, logout, isReady, roles, isAdmin, rolesChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
