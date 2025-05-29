import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    setIsAuthenticated,
    setUser,
    setToken,
    setLoading,
    setIsYouTubeConnected,
  } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        console.log("Query parameters:", Object.fromEntries(searchParams));
        console.log("Pathname:", location.pathname);
        const accessToken = searchParams.get("access_token");
        const userId = searchParams.get("user");
        const youtubeToken =
          searchParams.get("youtube_access_token") ||
          searchParams.get("access_token");

        // Check if this is a YouTube auth callback
        const normalizedPath = location.pathname.replace(/\/$/, "");
        if (normalizedPath === "/youtube/callback") {
          console.log("YouTube Token:", youtubeToken);
          if (youtubeToken) {
            localStorage.setItem("youtube_token", youtubeToken);
            console.log("YouTube token stored successfully");
            localStorage.setItem("youtube_connected", "true");
            if (setIsYouTubeConnected) {
              setIsYouTubeConnected(true);
            }
            toast({
              title: "YouTube Connected",
              description:
                "Your YouTube account has been connected successfully.",
            });
            navigate("/upload");
            return;
          } else {
            console.error("No YouTube token received in callback");
            setError(
              "Failed to get YouTube token. Please try connecting again."
            );
            setTimeout(() => navigate("/"), 3000);
            return;
          }
        }

        // Handle regular login callback
        if (accessToken && userId) {
          localStorage.setItem("token", accessToken);
          try {
            const userData = await api.handleAuthCallback(accessToken);
            localStorage.setItem("user", JSON.stringify(userData.user));
            if (setToken) setToken(accessToken);
            if (setUser) setUser(userData.user);
            if (setIsAuthenticated) setIsAuthenticated(true);
            if (setLoading) setLoading(false);
            toast({
              title: "Logged in successfully",
              description: `Welcome back, ${userData.user.name || "User"}!`,
            });
            navigate("/");
            return;
          } catch (userDataError) {
            console.error("Error fetching user data:", userDataError);
            const minimalUser = {
              sub: userId,
              email: "user@example.com",
              name: "User",
              picture: "",
            };
            localStorage.setItem("user", JSON.stringify(minimalUser));
            if (setUser) setUser(minimalUser);
            if (setIsAuthenticated) setIsAuthenticated(true);
            if (setLoading) setLoading(false);
            toast({
              title: "Logged in successfully",
              description: "Welcome back! (User details unavailable)",
            });
            navigate("/");
            return;
          }
        }

        // Handle authorization code
        const code = searchParams.get("code");
        if (code) {
          try {
            const tokenData = await api.exchangeCodeForToken(code);
            localStorage.setItem("token", tokenData.access_token);
            if (setToken) setToken(tokenData.access_token);
            if (setIsAuthenticated) setIsAuthenticated(true);
            if (setLoading) setLoading(false);
            toast({
              title: "Logged in successfully",
              description: "Welcome back!",
            });
            navigate("/");
            return;
          } catch (error) {
            console.error("Error exchanging code for token:", error);
            setError("Failed to exchange authorization code for token");
            setTimeout(() => navigate("/"), 3000);
            return;
          }
        }

        // Log unexpected parameters for debugging
        console.error(
          "Unexpected callback parameters:",
          Object.fromEntries(searchParams)
        );
        setError("Invalid callback parameters");
        setTimeout(() => navigate("/"), 3000);
      } catch (error) {
        console.error("Error in callback handler:", error);
        setError("An unexpected error occurred during authentication");
        setTimeout(() => navigate("/"), 3000);
      }
    };

    handleCallback();
  }, [
    location,
    navigate,
    setToken,
    setUser,
    setIsAuthenticated,
    setLoading,
    setIsYouTubeConnected,
    toast,
  ]);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full text-center">
        {error ? (
          <div className="text-destructive">
            <h2 className="text-2xl font-bold mb-2">Authentication Failed</h2>
            <p>{error}</p>
            <p className="mt-4 text-muted-foreground">
              Redirecting to home page...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Completing Login</h2>
            <p className="text-muted-foreground">
              Please wait while we complete your authentication...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
