/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const API_URL = 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');

    if (!savedToken) {
      setInitializing(false);
      return;
    }

    setToken(savedToken);

    const initialize = async () => {
      try {
        await Promise.all([
          getCurrentUser(savedToken),
          fetchAllUsers(savedToken),
          fetchDepartments(savedToken),
        ]);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  const getCurrentUser = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user');

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return null;
    }
  };

  const fetchAllUsers = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (err) {
    }
  };

  const fetchDepartments = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/departments`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
    }
  };

  const login = async (userId, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);

      // Fetch all users after login
      fetchAllUsers(data.token);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUsers([]);
    localStorage.removeItem('token');
  };

  const addUser = async (name, userId, password, role = 'user', department_id = null) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, userId, password, role, department_id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.error };
      }

      const data = await response.json();

      // Refresh users list
      if (user?.role === 'admin') {
        await Promise.all([
          fetchAllUsers(token),
          fetchDepartments(token),
        ]);
      }

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // Refresh users list
      await fetchAllUsers(token);
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh users list
      await fetchAllUsers(token);
      return true;
    } catch (err) {
      return false;
    }
  };

  const value = {
    user,
    users,
    departments,
    token,
    loading,
    error,
    initializing,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    fetchDepartments,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


