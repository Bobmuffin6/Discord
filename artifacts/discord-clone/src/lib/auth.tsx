import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter, setExtraHeaders } from "@workspace/api-client-react";

interface AuthUser {
  id: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  signIn: (name: string) => void;
  signOut: () => void;
  updateName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName");
    if (id && name) return { id, name };
    return null;
  });

  useEffect(() => {
    setAuthTokenGetter(() => user?.id ?? null);
    if (user) {
      setExtraHeaders({ "x-user-name": user.name });
    } else {
      setExtraHeaders({});
    }
  }, [user]);

  const signIn = (name: string) => {
    const existing = localStorage.getItem("userId");
    const id = existing || crypto.randomUUID();
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", name);
    setUser({ id, name });
  };

  const signOut = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setUser(null);
  };

  const updateName = (name: string) => {
    if (!user) return;
    localStorage.setItem("userName", name);
    setUser({ ...user, name });
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
