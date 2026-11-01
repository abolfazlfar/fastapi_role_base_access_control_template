import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { LoginCredentials, RegisterData, AuthState } from "@/types/auth.types";
import { authApi } from "@/api/auth.api";
import { authTokenService } from "@/services/auth-token.service";

const AuthContext = createContext<{
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: authTokenService.getToken(),
    isAuthenticated: !!authTokenService.getToken(),
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authTokenService.getToken();
        if (token) {
          const user = await authApi.me();
          setState((prev) => ({ ...prev, user, isAuthenticated: true, isLoading: false }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        authTokenService.removeToken();
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = await authApi.login(credentials);
    authTokenService.setToken(data.access_token);
    authTokenService.setRefreshToken(data.refresh_token);

    const user = await authApi.me();
    authTokenService.setUser(user);

    setState({
      user,
      token: data.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const tokenData = await authApi.register(data);
    authTokenService.setToken(tokenData.access_token);
    authTokenService.setRefreshToken(tokenData.refresh_token);

    const user = await authApi.me();
    authTokenService.setUser(user);

    setState({
      user,
      token: tokenData.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    } finally {
      authTokenService.removeToken();
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.me();
      authTokenService.setUser(user);
      setState((prev) => ({ ...prev, user }));
    } catch {
      authTokenService.removeToken();
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, register, logout, refreshUser, isLoading: state.isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
