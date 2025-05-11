
import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  isAdmin: boolean;
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
  const { toast } = useToast();

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
      const user = { id, isAdmin };
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("trailstudy_user", JSON.stringify(user));
      
      toast({
        title: "Logged in successfully",
        description: `Welcome, ${id}!`,
      });
      
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "ID and password must match",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("trailstudy_user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
