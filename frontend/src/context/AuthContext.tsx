"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  login as loginRequest,
  register as registerRequest,
  type LoginPayload,
  type RegisterPayload,
  type User,
} from "@/services/authService";
import {
  getCookie,
  getStorageItem,
  removeCookie,
  removeStorageItem,
  setCookie,
  setStorageItem,
} from "@/lib/storage";

type AuthContextValue = {
  authReady: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<void>;
  token: string;
  user: User | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedToken =
      getStorageItem("child_consult_token") || getCookie("child_consult_token");
    const savedUser = getStorageItem("child_consult_user");

    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User);
      } catch {
        removeStorageItem("child_consult_user");
      }
    }
    setAuthReady(true);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const data = await loginRequest(payload);
      setToken(data.token);
      setUser(data.user);
      setStorageItem("child_consult_token", data.token);
      setStorageItem("child_consult_user", JSON.stringify(data.user));
      setCookie("child_consult_token", data.token);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      await registerRequest(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    removeStorageItem("child_consult_token");
    removeStorageItem("child_consult_user");
    removeCookie("child_consult_token");
  }, []);

  const value = useMemo(
    () => ({ authReady, loading, login, logout, register, token, user }),
    [authReady, loading, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
