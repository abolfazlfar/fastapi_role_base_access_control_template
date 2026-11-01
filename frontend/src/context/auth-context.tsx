import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; email: string; username: string } | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { state } = useAuth();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
