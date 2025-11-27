import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { storage } from "./storage";

interface AuthContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedId = await storage.getItem("userId");
        if (storedId) setUserIdState(storedId);
      } catch (error) {
        console.log("Error loading userId:", error);
      }
    };
    loadUserId();
  }, []);

  const setUserId = async (id: string | null) => {
    try {
      if (id) {
        await storage.setItem("userId", id);
      } else {
        await storage.removeItem("userId");
      }
      setUserIdState(id);
    } catch (error) {
      console.log("Error setting userId:", error);
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem("userId");
      setUserIdState(null);
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userId, setUserId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
