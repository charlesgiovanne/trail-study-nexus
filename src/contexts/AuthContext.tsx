
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  fullName: string;
  isAdmin: boolean;
  createdTopics: string[];
  folders: any[];
};

interface AuthContextType {
  user: User | null;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("trailstudy_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("trailstudy_user");
      }
    }
  }, []);

  const login = async (id: string, password: string) => {
    // In a real app, you would validate credentials against a backend
    // For this demo, we'll check if ID matches password as per requirements
    if (id === password) {
      const isAdmin = id === "2023305700";
      const user = { 
        id, 
        fullName: isAdmin ? "Admin User" : "Student User", // Default name if not set
        isAdmin,
        createdTopics: [],
        folders: []
      };
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("trailstudy_user", JSON.stringify(user));
      
      toast.success(`Welcome, ${user.fullName}!`);
      
      return true;
    } else {
      toast.error("ID and password must match");
      
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("trailstudy_user");
    toast.success("You have been logged out successfully");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
