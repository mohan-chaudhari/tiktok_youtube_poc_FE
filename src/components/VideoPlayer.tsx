import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    toast({
      title: "Error",
      description: "Failed to load video. Please try again later.",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-5xl p-0 bg-background/95 backdrop-blur-sm",
        "border-0 shadow-2xl",
        "rounded-lg overflow-hidden"
      )}>
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "absolute top-2 right-2",
              "h-8 w-8 rounded-full",
              "bg-black/50 hover:bg-black/70",
              "text-white hover:text-white",
              "z-10"
            )}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Video container */}
          <div className="relative pt-[56.25%] bg-black">
            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Failed to load video</p>
              </div>
            ) : (
              <video
                src={videoUrl}
                controls
                autoPlay
                className={cn(
                  "absolute inset-0 w-full h-full",
                  "rounded-lg",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
                onError={handleError}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer; 