import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter, setExtraHeaders } from "@workspace/api-client-react";

interface AuthUser {
  id: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  updateName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simple password hashing using Web Crypto (SHA-256 + salt)
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAccounts(): Record<string, { id: string; hash: string; salt: string }> {
  try {
    return JSON.parse(localStorage.getItem("accounts") || "{}");
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, { id: string; hash: string; salt: string }>) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

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

  const signUp = async (username: string, password: string): Promise<void> => {
    const accounts = getAccounts();
    const key = username.toLowerCase();
    if (accounts[key]) {
      throw new Error("Username already taken");
    }
    const salt = crypto.randomUUID();
    const hash = await hashPassword(password, salt);
    const id = crypto.randomUUID();
    accounts[key] = { id, hash, salt };
    saveAccounts(accounts);
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", username);
    setUser({ id, name: username });
  };

  const signIn = async (username: string, password: string): Promise<void> => {
    const accounts = getAccounts();
    const key = username.toLowerCase();
    const account = accounts[key];
    if (!account) {
      throw new Error("No account found with that username");
    }
    const hash = await hashPassword(password, account.salt);
    if (hash !== account.hash) {
      throw new Error("Incorrect password");
    }
    localStorage.setItem("userId", account.id);
    localStorage.setItem("userName", username);
    setUser({ id: account.id, name: username });
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
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
