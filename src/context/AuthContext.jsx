import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";
import { requestNotificationPermission } from "../firebase/requestNotificationPermission";
export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= GET LOGGED IN USER =================

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/getProfile");

        setUser(res.data.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ================= REGISTER =================

  const registerUser = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Registration failed",
      };
    }
  };

  // ================= LOGIN =================

  const loginUser = async (email, password) => {
  try {
      
    // Login
    await api.post("/auth/login", {
      email,
      password,
    });

    // Get User Profile
    const profile = await api.get("/auth/getProfile");

    const userData = profile.data.data;

    // Save User in Context
    setUser(userData);

    // Generate & Save FCM Token
    await requestNotificationPermission();

    return {
      success: true,
      role: userData.role,
    };

  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message || "Login failed",
    };
  }
};

  // ================= LOGOUT =================

  const logoutUser = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log(err);
    } finally {
      setUser(null);
    }
  };

  const values = {
    user,
    setUser,
    loading,

    registerUser,
    loginUser,
    logoutUser,

    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return (
    <AuthContext.Provider value={values}>
      {children}
      
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;