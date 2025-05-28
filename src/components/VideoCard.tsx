import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileVideo, Download, Share, Upload, Trash2, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VideoFile } from '@/lib/api';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: VideoFile;
  type: 'downloaded' | 'converted';
  onConvert?: (video: VideoFile) => void;
  onDelete?: (video: VideoFile) => void;
  onUpload?: (video: VideoFile) => void;
  onPlay?: (video: VideoFile) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  type,
  onConvert,
  onDelete,
  onUpload,
  onPlay,
}) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <Card className={cn(
      "video-card h-full flex flex-col transition-all duration-300",
      "hover:shadow-md hover:border-primary/50"
    )}>
      <div className="relative pt-[56.25%] overflow-hidden rounded-t-lg">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.filename}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-tiktok-blue/20 to-tiktok-red/20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA4aDEydjEySDM2Vjh6bTAgMjBoMTJ2MTJIMzZWMjh6bS0yMCAyMGgxMnYxMkgxNlYyOHptMC0yMGgxMnYxMkgxNlY4eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDIiLz48L2c+PC9zdmc+')] opacity-20" />
            <div className="relative transform transition-transform hover:scale-105">
              <div className="absolute inset-0 blur-[2px] opacity-50 text-white/40">
                <Play className="h-12 w-12" />
              </div>
              <Play className="h-12 w-12 text-white/80 relative z-10 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" />
            </div>
          </div>
        )}
        {onPlay && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-white/20 hover:bg-gradient-to-r hover:from-tiktok-blue hover:to-tiktok-red text-white opacity-0 hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
            onClick={() => onPlay(video)}
          >
            <Play className="h-6 w-6 stroke-[3]" />
          </Button>
        )}
      </div>
      
      <CardContent className="flex-grow p-4">
        <h3 className="font-medium truncate text-sm" title={video.filename}>
          {video.filename}
        </h3>
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>{formatFileSize(video.size_bytes)}</p>
          <p>{formatDate(video.created_at)}</p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
        {type === 'downloaded' && onConvert && (
          <Button 
            size="sm" 
            variant="default" 
            className="w-full"
            onClick={() => onConvert(video)}
          >
            <Download className="h-4 w-4 mr-2" />
            Convert
          </Button>
        )}
        
        {type === 'converted' && onUpload && (
          <Button 
            size="sm" 
            variant="default" 
            className="w-full"
            onClick={() => onUpload(video)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
        
        {onDelete && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            onClick={() => onDelete(video)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
