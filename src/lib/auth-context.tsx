import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in ms

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem("noxx_auth");
    if (storedAuth) {
      try {
        const { user, expiresAt } = JSON.parse(storedAuth);
        if (Date.now() < expiresAt) {
          setUser(user);
        } else {
          localStorage.removeItem("noxx_auth");
        }
      } catch (e) {
        localStorage.removeItem("noxx_auth");
      }
    }
    setIsLoaded(true);
  }, []);

  const login = (email: string) => {
    const dummyUser: User = {
      id: "usr_dummy",
      name: "Kagabo Jean",
      email,
    };
    const sessionData = {
      user: dummyUser,
      expiresAt: Date.now() + SESSION_DURATION,
    };
    localStorage.setItem("noxx_auth", JSON.stringify(sessionData));
    setUser(dummyUser);
  };

  const logout = () => {
    localStorage.removeItem("noxx_auth");
    setUser(null);
  };

  if (!isLoaded) return null;

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
