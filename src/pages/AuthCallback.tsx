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
  const { setIsAuthenticated, setUser, setToken, setLoading, setIsYouTubeConnected } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const accessToken = searchParams.get("access_token");
        const userId = searchParams.get("user");

        // Check if this is a YouTube auth callback
        if (location.pathname === "/youtube/callback") {
          // Get YouTube token from response
          const youtubeToken = searchParams.get("youtube_access_token");
          if (youtubeToken) {
            localStorage.setItem("youtube_token", youtubeToken);
            console.log("YouTube token stored successfully");
            
            // Set YouTube connected state
            localStorage.setItem("youtube_connected", "true");
            if (setIsYouTubeConnected) {
              setIsYouTubeConnected(true);
            }

            toast({
              title: "YouTube Connected",
              description: "Your YouTube account has been connected successfully.",
            });

            // Redirect to upload page
            navigate("/upload");
            return;
          } else {
            console.error("No YouTube token received in callback");
            setError("Failed to get YouTube token. Please try connecting again.");
            setTimeout(() => navigate("/"), 3000);
            return;
          }
        }

        // Handle regular login callback
        if (accessToken && userId) {
          // Store the token immediately
          localStorage.setItem("token", accessToken);

          try {
            // Get user data using the token
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

            // Redirect to index page
            navigate("/");
            return;
          } catch (userDataError) {
            console.error("Error fetching user data:", userDataError);
            // Even if we can't get user data, we still have a token, so we're authenticated
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

            // Redirect to index page
            navigate("/");
            return;
          }
        }

        // If no token in URL, check for authorization code
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

            // Redirect to index page
            navigate("/");
            return;
          } catch (error) {
            console.error("Error exchanging code for token:", error);
            setError("Failed to exchange authorization code for token");
            setTimeout(() => navigate("/"), 3000);
            return;
          }
        }

        // If we get here, something went wrong
        setError("Invalid callback parameters");
        setTimeout(() => navigate("/"), 3000);
      } catch (error) {
        console.error("Error in callback handler:", error);
        setError("An unexpected error occurred during authentication");
        setTimeout(() => navigate("/"), 3000);
      }
    };

    handleCallback();
  }, [location, navigate, setToken, setUser, setIsAuthenticated, setLoading, setIsYouTubeConnected, toast]);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full text-center">
        {error ? (
          <div className="text-destructive">
            <h2 className="text-2xl font-bold mb-2">Authentication Failed</h2>
            <p>{error}</p>
            <p className="mt-4 text-muted-foreground">Redirecting to home page...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Completing Login</h2>
            <p className="text-muted-foreground">Please wait while we complete your authentication...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
