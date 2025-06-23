import React, { createContext, useContext, useState, useEffect } from "react";
import type { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Demo users for authentication
const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: "1",
    email: "admin@studiokatalika.com",
    password: "admin123",
    name: "Administrator",
    role: "admin",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    email: "user@studiokatalika.com",
    password: "user123",
    name: "Staff User",
    role: "user",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("studio_katalika_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("studio_katalika_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      const userWithLastLogin = {
        ...userWithoutPassword,
        lastLogin: new Date().toISOString(),
      };

      setUser(userWithLastLogin);
      localStorage.setItem(
        "studio_katalika_user",
        JSON.stringify(userWithLastLogin)
      );
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("studio_katalika_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
