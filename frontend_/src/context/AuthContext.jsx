import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/patient/profile');
        setUser(data);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem('token')) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('name', data.name);

    // ✅ TEMP user so UI doesn't break
    setUser({ name: data.name, role: data.role });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);