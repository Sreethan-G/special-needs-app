import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { storage } from "./storage";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";

interface AuthContextType {
  userId: string | null; // MongoDB userId
  firebaseUser: User | null; // Firebase user object
  setUserId: (id: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Load MongoDB userId from storage
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

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsubscribe;
  }, [auth]);

  // Set MongoDB userId in state and storage
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

  // Logout from both Firebase and MongoDB
  const logout = async () => {
    try {
      await storage.removeItem("userId");
      setUserIdState(null);
      if (firebaseUser) {
        await signOut(auth);
      }
      setFirebaseUser(null);
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userId, firebaseUser, setUserId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
