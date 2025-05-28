import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api, { QualityPreset } from "@/lib/api";

interface ConversionFormProps {
  filePath: string;
  fileName: string;
  onConversionComplete: (outputPath: string, outputName: string) => void;
  onCancel?: () => void;
}

const ConversionForm: React.FC<ConversionFormProps> = ({
  filePath,
  fileName,
  onConversionComplete,
  onCancel,
}) => {
  const [quality, setQuality] = useState<QualityPreset>(
    QualityPreset.TIKTOK_TO_YOUTUBE_16_9
  );
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Format for display
  const formatQualityLabel = (quality: string): string => {
    return quality
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("Tik Tok", "TikTok")
      .replace("You Tube", "YouTube");
  };

  // Get quality options
  const qualityOptions = Object.values(QualityPreset).map((value) => ({
    value,
    label: formatQualityLabel(value),
  }));

  // Handle conversion
  const handleConvert = async () => {
    setIsLoading(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 500);

      // Convert video
      const response = await api.convertVideo({
        input_path: filePath,
        quality,
      });

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: "Conversion successful",
        description: "The video has been converted successfully",
      });

      onConversionComplete(response.output_path, response.output_name);
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during conversion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convert Video</CardTitle>
        <CardDescription>
          Select conversion options for your TikTok video.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="filename">Selected File</Label>
            <div className="border rounded-md p-3 bg-muted/30">{fileName}</div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="quality">Conversion Profile</Label>
            <Select
              value={quality}
              onValueChange={(value) => setQuality(value as QualityPreset)}
              disabled={isLoading}
            >
              <SelectTrigger id="quality">
                <SelectValue placeholder="Select quality preset" />
              </SelectTrigger>
              <SelectContent position="popper">
                {qualityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="flex flex-col space-y-2">
              <Label>Conversion Progress</Label>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleConvert} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            "Start Conversion"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConversionForm;
