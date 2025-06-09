import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Set up axios interceptor for authentication
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      config => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Fetch user data if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/users/me');
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/token', {
        username,
        password
      });
      
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Fetch user data
      const userResponse = await axios.get('http://localhost:8000/users/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setCurrentUser(userResponse.data);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      await axios.post('http://localhost:8000/users', {
        username,
        email,
        password
      });
      
      // Auto login after registration
      return await login(username, password);
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
