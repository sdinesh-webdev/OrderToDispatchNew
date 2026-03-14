import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('otd_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  const login = async (id, pass) => {
    const allPages = ["Dashboard", "Order", "Dispatch Planning", "Inform to Party Before Dispatch", "Dispatch Completed", "Inform to Party After Dispatch", "Settings"];

    // Always check default admin credentials first
    if (id === "admin" && pass === "admin123") {
      const userData = { id: "admin", name: "Administrator", role: "admin", pageAccess: allPages };
      setUser(userData);
      localStorage.setItem('otd_user', JSON.stringify(userData));
      return true;
    }

    // Always check default user credentials
    if (id === "user" && pass === "user123") {
      const userData = { id: "user", name: "User", role: "user", pageAccess: allPages };
      setUser(userData);
      localStorage.setItem('otd_user', JSON.stringify(userData));
      return true;
    }

    // Since we removed persistence, we only support default credentials for now
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('otd_user');
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
