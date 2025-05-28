import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface UploadFormProps {
  filePath: string;
  fileName: string;
  onUploadComplete: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  filePath,
  fileName,
  onUploadComplete,
}) => {
  const [title, setTitle] = useState(fileName.replace(/\.[^/.]+$/, ""));
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isYouTubeConnected, connectYouTube } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your YouTube video",
        variant: "destructive", // Changed from "warning" to "destructive"
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      // Parse tags
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 500);

      // Upload to YouTube
      await api.uploadToYouTube(filePath, title, description, tagArray);

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: "Upload successful",
        description: "Your video has been uploaded to YouTube",
      });

      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isYouTubeConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>YouTube Upload</CardTitle>
          <CardDescription>
            Connect your YouTube account to upload videos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            {" "}
            {/* Changed from "warning" to "default" */}
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>YouTube account not connected</AlertTitle>
            <AlertDescription>
              You need to connect your YouTube account to upload videos.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={connectYouTube}>Connect YouTube Account</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Upload to YouTube</CardTitle>
          <CardDescription>
            Enter details for your YouTube video.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="filename">Selected File</Label>
              <div className="border rounded-md p-3 bg-muted/30">
                {fileName}
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for your video"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="tag1, tag2, tag3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {isLoading && (
              <div className="flex flex-col space-y-2">
                <Label>Upload Progress</Label>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(progress)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload to YouTube"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UploadForm;
