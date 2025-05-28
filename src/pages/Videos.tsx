import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import ConversionForm from "@/components/ConversionForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Search, SortAsc, SortDesc, Video } from "lucide-react";
import api, { VideoFile, getVideoStreamUrl } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { QualityPreset } from "@/lib/api";

const Videos = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<string>("downloaded");
  const [downloadedVideos, setDownloadedVideos] = useState<VideoFile[]>([]);
  const [convertedVideos, setConvertedVideos] = useState<VideoFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [videoToConvert, setVideoToConvert] = useState<VideoFile | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionProgress, setConversionProgress] = useState<number>(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch videos on mount and tab change
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "downloaded") {
          const response = await api.getDownloadedVideos();
          setDownloadedVideos(response.videos);
        } else {
          const response = await api.getConvertedVideos();
          setConvertedVideos(response.videos);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast({
          title: "Error",
          description: "Failed to fetch videos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [activeTab, toast]);

  // Filter and sort videos
  const getFilteredVideos = () => {
    const videos =
      activeTab === "downloaded" ? downloadedVideos : convertedVideos;

    // Filter by search term
    const filtered = searchTerm
      ? videos.filter((video) =>
          video.filename.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : videos;

    // Sort by date
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });
  };

  // Handle conversion button click - show conversion form
  const handleConvert = (video: VideoFile) => {
    setVideoToConvert(video);
  };

  // Handle actual conversion process
  const handleStartConversion = async (
    outputPath: string,
    outputName: string
  ) => {
    try {
      // Refresh the videos list
      const convertedResponse = await api.getConvertedVideos();
      setConvertedVideos(convertedResponse.videos);

      // Switch to converted tab
      setActiveTab("converted");

      toast({
        title: "Conversion successful",
        description: "The video has been converted successfully",
      });
    } catch (error) {
      console.error("Error refreshing videos:", error);
    } finally {
      setVideoToConvert(null);
    }
  };

  // Handle cancel conversion
  const handleCancelConversion = () => {
    setVideoToConvert(null);
  };

  // Handle upload
  const handleUpload = (video: VideoFile) => {
    navigate("/upload", {
      state: {
        filePath: video.file_path,
        fileName: video.filename,
      },
    });
  };

  // Handle delete
  const handleDelete = (video: VideoFile) => {
    setSelectedVideo(video);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedVideo) return;

    try {
      await api.deleteVideo(
        selectedVideo.file_path,
        activeTab as "downloaded" | "converted"
      );

      // Update the local state after successful deletion
      if (activeTab === "downloaded") {
        setDownloadedVideos((prev) =>
          prev.filter((v) => v.file_path !== selectedVideo.file_path)
        );
      } else {
        setConvertedVideos((prev) =>
          prev.filter((v) => v.file_path !== selectedVideo.file_path)
        );
      }

      toast({
        title: "Success",
        description: `${selectedVideo.filename} has been deleted`,
      });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    }

    setSelectedVideo(null);
  };

  // Handle play video
  const handlePlayVideo = (video: VideoFile) => {
    setCurrentVideoUrl(getVideoStreamUrl(video.filename));
    setIsPlayerOpen(true);
  };

  const filteredVideos = getFilteredVideos();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Videos</h1>
            <p className="text-muted-foreground">
              Manage your downloaded and converted videos
            </p>
          </div>

          <Button onClick={() => navigate("/")}>
            <Download className="mr-2 h-4 w-4" />
            Download New Video
          </Button>
        </div>

        <Tabs
          defaultValue="downloaded"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="downloaded" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Downloaded Videos
              </TabsTrigger>
              <TabsTrigger value="converted" className="flex items-center">
                <Video className="mr-2 h-4 w-4" />
                Converted Videos
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search videos..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                title={`Sort by date ${
                  sortDirection === "asc" ? "descending" : "ascending"
                }`}
              >
                {sortDirection === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <TabsContent value="downloaded">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading downloaded videos...
                </p>
              </div>
            ) : downloadedVideos.length === 0 ? (
              <div className="py-12 text-center border rounded-lg">
                <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No downloaded videos yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Download TikTok videos to see them here
                </p>
                <Button onClick={() => navigate("/")}>Download a Video</Button>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="py-12 text-center border rounded-lg">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No matching videos</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.file_path}
                    video={video}
                    type="downloaded"
                    onConvert={handleConvert}
                    onDelete={handleDelete}
                    onPlay={handlePlayVideo}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="converted">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading converted videos...
                </p>
              </div>
            ) : convertedVideos.length === 0 ? (
              <div className="py-12 text-center border rounded-lg">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No converted videos yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Convert your downloaded videos to see them here
                </p>
                <Button onClick={() => navigate("/")}>Convert a Video</Button>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="py-12 text-center border rounded-lg">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No matching videos</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.file_path}
                    video={video}
                    type="converted"
                    onUpload={handleUpload}
                    onDelete={handleDelete}
                    onPlay={handlePlayVideo}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Video Player Dialog */}
        <VideoPlayer
          videoUrl={currentVideoUrl}
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!selectedVideo}
          onOpenChange={() => setSelectedVideo(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Video</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this video? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Conversion Dialog */}
        <Dialog
          open={!!videoToConvert}
          onOpenChange={(open) => !open && setVideoToConvert(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Convert Video</DialogTitle>
              <DialogDescription>
                Select conversion options for your TikTok video.
              </DialogDescription>
            </DialogHeader>
            {videoToConvert && (
              <ConversionForm
                filePath={videoToConvert.file_path}
                fileName={videoToConvert.filename}
                onConversionComplete={handleStartConversion}
                onCancel={handleCancelConversion}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>

      <footer className="border-t py-6 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TikTok Converter. All rights
              reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Videos;
