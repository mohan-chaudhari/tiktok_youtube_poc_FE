import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface DownloadFormProps {
  onDownloadComplete: (filePath: string, filename: string) => void;
}

const DownloadForm: React.FC<DownloadFormProps> = ({ onDownloadComplete }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast({
        title: "URL is required",
        description: "Please enter a valid TikTok URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    if (!url.includes("tiktok.com")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid TikTok URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.downloadTikTokVideo({ url });

      toast({
        title: "Download successful",
        description: "The TikTok video has been downloaded",
      });

      onDownloadComplete(response.file_path, response.filename);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during download",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Download TikTok Video</CardTitle>
          <CardDescription>
            Enter the URL of the TikTok video you want to download and convert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tiktok-url">TikTok URL</Label>
              <Input
                id="tiktok-url"
                type="url"
                autoComplete="off"
                placeholder="https://www.tiktok.com/@username/video/1234567890"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              "Download Video"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default DownloadForm;
