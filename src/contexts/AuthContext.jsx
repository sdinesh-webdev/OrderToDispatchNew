import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (id, pass) => {
    const allPages = ["Dashboard", "Order", "Disp Plan", "Notify Party", "Disp Done", "Post-Disp Notify", "Settings"];

    // Always check default admin credentials first
    if (id === "admin" && pass === "admin123") {
      setUser({ id: "admin", name: "Administrator", role: "admin", pageAccess: allPages });
      return true;
    }

    // Always check default user credentials
    if (id === "user" && pass === "user123") {
      setUser({ id: "user", name: "User", role: "user", pageAccess: allPages });
      return true;
    }

    // Then check localStorage users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const matched = users.find(u => u.id === id && u.password === pass);

    if (matched) {
      setUser({
        id: matched.id,
        name: matched.name,
        role: matched.role,
        pageAccess: matched.pageAccess
      });
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
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
