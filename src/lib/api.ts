import { toast } from "sonner";

// API base URL from environment variable
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");
// Remove trailing slash if present to avoid double slashes in URLs

// Enum for quality presets
export enum QualityPreset {
  HIGH = "high",
  STANDARD = "standard",
  ULTRAHD = "ultraHD",
  TIKTOK_TO_YOUTUBE_16_9 = "tiktokToYouTube16_9",
  TIKTOK_TO_YOUTUBE_16_9_BLUR = "tiktokToYouTube16_9Blur",
  TIKTOK_TO_YOUTUBE_SIMPLE = "tiktokToYouTubeSimple",
  TIKTOK_TO_YOUTUBE_COLOR_BORDER = "tiktokToYouTubeColorBorder",
  TIKTOK_TO_YOUTUBE_HIGH_PERFORMANCE = "tiktokToYouTubeHighPerformance",
  TIKTOK_TO_YOUTUBE_SUBTITLE = "tiktokToYouTubeSubtitle",
  TIKTOK_TO_720P = "tiktokTo720p",
}

// Download request
export interface DownloadRequest {
  url: string;
  output_folder?: string;
}

export interface DownloadResponse {
  success: boolean;
  message: string;
  file_path: string;
  filename: string;
  video_info: object;
}

// Convert request
export interface ConvertRequest {
  input_path: string;
  output_folder?: string;
  quality?: QualityPreset;
}

export interface ConvertResponse {
  success: boolean;
  message: string;
  input_path: string;
  output_path: string;
  output_name: string;
}

// Video file
export interface VideoFile {
  filename: string;
  file_path: string;
  size_bytes: number;
  created_at: string;
  thumbnail?: string; // Added for UI
}

export interface VideoListResponse {
  videos: VideoFile[];
  total_count: number;
  folder_path: string;
}

// Function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Base fetch function with auth and error handling
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "60";
      toast.error(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
      );
      throw new Error(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
      );
    }

    // Handle auth errors
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

// API Functions
export const api = {
  // Google OAuth login
  googleLogin: () => {
    // Redirect to the backend's Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/login`;
    console.log(`Redirecting to: ${API_BASE_URL}/auth/login`);
  },

  // Exchange authorization code for access token
  exchangeCodeForToken: async (code: string): Promise<any> => {
    console.log("Exchanging authorization code for token");
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to exchange code for token");
    }

    return response.json();
  },

  // Handle OAuth callback
  handleAuthCallback: async (token: string): Promise<any> => {
    console.log("Fetching user data with token");
    // Use the token to get user data
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get user data");
      }

      // Return user data and the token
      const userData = await response.json();
      return {
        token: token, // Return the same token that was passed in
        user: userData,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  },

  // Download TikTok video
  downloadTikTokVideo: async (
    request: DownloadRequest
  ): Promise<DownloadResponse> => {
    return fetchWithAuth("/download", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // Convert video
  convertVideo: async (request: ConvertRequest): Promise<ConvertResponse> => {
    return fetchWithAuth("/convert", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // Upload to YouTube
  uploadToYouTube: async (
    filePath: string,
    title: string,
    description: string,
    tags: string[]
  ) => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    // Get YouTube token from localStorage
    const youtubeToken = localStorage.getItem("youtube_token");
    if (!youtubeToken) {
      throw new Error("YouTube authorization required");
    }

    const response = await fetch(
      `${API_BASE_URL}/youtube/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "YouTube-Authorization": `Bearer ${youtubeToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_path: filePath,
          title: title,
          description: description || "",
          login_token: token,
          youtube_token: youtubeToken,
          tags: tags,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || "Upload failed");
    }

    return response.json();
  },

  // Get downloaded videos
  getDownloadedVideos: async (): Promise<VideoListResponse> => {
    return fetchWithAuth("/videos/downloaded");
  },

  // Get converted videos
  getConvertedVideos: async (): Promise<VideoListResponse> => {
    return fetchWithAuth("/videos/converted");
  },

  // Delete video
  deleteVideo: async (filePath: string, type: 'downloaded' | 'converted'): Promise<{ success: boolean, message: string }> => {
    return fetchWithAuth("/videos/delete", {
      method: "DELETE",
      body: JSON.stringify({
        file_path: filePath,
        type: type
      }),
    });
  },

  // Get user profile
  getUserProfile: async () => {
    return fetchWithAuth("/user");
  },

  // Authorize YouTube
  authorizeYouTube: async () => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    // Redirect to YouTube auth endpoint
    window.location.href = `${API_BASE_URL}/youtube/auth?token=${token}`;
    console.log(`Redirecting to: ${API_BASE_URL}/youtube/auth?token=${token}`);
    return { success: true }; // This won't actually be returned due to the redirect
  },
};

// MOCK API for development
export const mockApi = {
  // Mock Google OAuth login
  googleLogin: () => {
    // For mock, we'll just simulate a successful login after a delay
    setTimeout(() => {
      const mockUser = {
        sub: "123456789",
        email: "user@example.com",
        name: "Test User",
        picture: "https://ui-avatars.com/api/?name=Test+User&background=random",
      };

      const mockToken =
        "mock-jwt-token-" + Math.random().toString(36).substring(2);

      // Store in localStorage
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

      // Redirect to home
      window.location.href = "/";
    }, 1500);
  },

  // Mock exchange code for token
  exchangeCodeForToken: async (code: string): Promise<any> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Mock API: Exchanging code for token", code);

    const mockToken =
      "mock-access-token-" + Math.random().toString(36).substring(2);

    return {
      access_token: mockToken,
      token_type: "Bearer",
      expires_in: 3600,
      user: {
        sub: "123456789",
        email: "user@example.com",
        name: "Test User",
        picture: "https://ui-avatars.com/api/?name=Test+User&background=random",
      },
    };
  },

  // Mock OAuth callback handler
  handleAuthCallback: async (token: string): Promise<any> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Mock API: Handling auth callback with token", token);

    return {
      token: token, // Return the same token that was passed in
      user: {
        sub: "123456789",
        email: "user@example.com",
        name: "Test User",
        picture: "https://ui-avatars.com/api/?name=Test+User&background=random",
      },
    };
  },

  // Mock download
  downloadTikTokVideo: async (
    request: DownloadRequest
  ): Promise<DownloadResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      message: "Video downloaded successfully",
      file_path: "/videos/downloaded/video123.mp4",
      filename: "video123.mp4",
      video_info: {
        title: "TikTok Video",
        author: "@user123",
        duration: 60,
      },
    };
  },

  // Mock convert
  convertVideo: async (request: ConvertRequest): Promise<ConvertResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      success: true,
      message: "Video converted successfully",
      input_path: request.input_path,
      output_path: "/videos/converted/video123_converted.mp4",
      output_name: "video123_converted.mp4",
    };
  },

  // Mock YouTube upload
  uploadToYouTube: async (
    filePath: string,
    title: string,
    description: string,
    tags: string[]
  ) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Check if YouTube is connected
    const ytConnected = localStorage.getItem("youtube_connected") === "true";
    if (!ytConnected) {
      throw new Error("YouTube account not connected");
    }

    return {
      success: true,
      message: "Video uploaded to YouTube successfully",
      youtube_url: "https://youtube.com/watch?v=123456",
    };
  },

  // Mock downloaded videos
  getDownloadedVideos: async (): Promise<VideoListResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      videos: [
        {
          filename: "tiktok_dance.mp4",
          file_path: "/videos/downloaded/tiktok_dance.mp4",
          size_bytes: 25000000,
          created_at: "2025-04-10T12:00:00Z",
          thumbnail: "https://picsum.photos/id/1/300/200",
        },
        {
          filename: "cooking_tutorial.mp4",
          file_path: "/videos/downloaded/cooking_tutorial.mp4",
          size_bytes: 15000000,
          created_at: "2025-04-09T14:30:00Z",
          thumbnail: "https://picsum.photos/id/2/300/200",
        },
        {
          filename: "travel_vlog.mp4",
          file_path: "/videos/downloaded/travel_vlog.mp4",
          size_bytes: 35000000,
          created_at: "2025-04-08T09:15:00Z",
          thumbnail: "https://picsum.photos/id/3/300/200",
        },
      ],
      total_count: 3,
      folder_path: "/videos/downloaded",
    };
  },

  // Mock converted videos
  getConvertedVideos: async (): Promise<VideoListResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      videos: [
        {
          filename: "tiktok_dance_converted.mp4",
          file_path: "/videos/converted/tiktok_dance_converted.mp4",
          size_bytes: 45000000,
          created_at: "2025-04-10T12:30:00Z",
          thumbnail: "https://picsum.photos/id/4/300/200",
        },
        {
          filename: "cooking_tutorial_converted.mp4",
          file_path: "/videos/converted/cooking_tutorial_converted.mp4",
          size_bytes: 30000000,
          created_at: "2025-04-09T15:00:00Z",
          thumbnail: "https://picsum.photos/id/5/300/200",
        },
      ],
      total_count: 2,
      folder_path: "/videos/converted",
    };
  },

  // Mock user profile
  getUserProfile: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      sub: "123456789",
      email: "user@example.com",
      name: "Test User",
      picture: "https://ui-avatars.com/api/?name=Test+User&background=random",
    };
  },

  // Mock YouTube authorization
  authorizeYouTube: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, this would redirect to YouTube auth
    // For mock, we'll just simulate a successful connection
    localStorage.setItem("youtube_connected", "true");

    return {
      success: true,
      message: "YouTube account connected successfully",
    };
  },
};

// For development, use real API if available, otherwise use mockApi
export default api;

// Get video stream URL
export const getVideoStreamUrl = (filename: string): string => {
  // Remove any path components from the filename
  const cleanFilename = filename.split('/').pop() || filename;
  return `${API_BASE_URL}/videos/stream/${cleanFilename}`;
};
