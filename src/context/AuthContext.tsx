import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface User {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isYouTubeConnected: boolean;
  login: () => void;
  logout: () => void;
  connectYouTube: () => void;
  disconnectYouTube: () => void;
  loading: boolean;
  setIsAuthenticated?: (isAuthenticated: boolean) => void;
  setUser?: (user: User | null) => void;
  setToken?: (token: string | null) => void;
  setLoading?: (loading: boolean) => void;
  setIsYouTubeConnected?: (isYouTubeConnected: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  isYouTubeConnected: false,
  login: () => {},
  logout: () => {},
  connectYouTube: () => {},
  disconnectYouTube: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const ytConnected = localStorage.getItem("youtube_connected") === "true";

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setIsYouTubeConnected(ytConnected);
    }

    setLoading(false);
  }, []);

  // Google OAuth login
  const login = () => {
    setLoading(true);

    // Redirect to Google OAuth
    try {
      api.googleLogin();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description:
          error instanceof Error ? error.message : "Failed to initiate login",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      // Call the logout API endpoint
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("youtube_connected");

      // Update state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsYouTubeConnected(false);
      setLoading(false);

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    }
  };

  const connectYouTube = async () => {
    setLoading(true);

    try {
      // Call the real API - this will redirect to YouTube OAuth
      await api.authorizeYouTube();

      // Note: The actual setting of YouTube connected state will happen
      // in the callback handler, but we set it here for the mock API
      if (import.meta.env.DEV) {
        localStorage.setItem("youtube_connected", "true");
        setIsYouTubeConnected(true);

        toast({
          title: "YouTube Connected",
          description: "Your YouTube account has been connected successfully.",
        });
      }
    } catch (error) {
      console.error("YouTube connection error:", error);
      toast({
        title: "Connection Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect YouTube account",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const disconnectYouTube = () => {
    setLoading(true);

    localStorage.removeItem("youtube_connected");
    setIsYouTubeConnected(false);
    setLoading(false);

    toast({
      title: "YouTube Disconnected",
      description: "Your YouTube account has been disconnected.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        isYouTubeConnected,
        login,
        logout,
        connectYouTube,
        disconnectYouTube,
        loading,
        setIsAuthenticated,
        setUser,
        setToken,
        setLoading,
        setIsYouTubeConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
