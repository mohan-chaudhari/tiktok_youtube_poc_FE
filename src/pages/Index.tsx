import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import DownloadForm from '@/components/DownloadForm';
import ConversionForm from '@/components/ConversionForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Download, Upload, Video } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [downloadedFilePath, setDownloadedFilePath] = useState<string>('');
  const [downloadedFileName, setDownloadedFileName] = useState<string>('');
  const [convertedFilePath, setConvertedFilePath] = useState<string>('');
  const [convertedFileName, setConvertedFileName] = useState<string>('');

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Handle download completion
  const handleDownloadComplete = (filePath: string, fileName: string) => {
    setDownloadedFilePath(filePath);
    setDownloadedFileName(fileName);
    setCurrentStep(2);
  };

  // Handle conversion completion
  const handleConversionComplete = (outputPath: string, outputName: string) => {
    setConvertedFilePath(outputPath);
    setConvertedFileName(outputName);
    setCurrentStep(3);
  };

  // Proceed to upload
  const handleProceedToUpload = () => {
    navigate('/upload', {
      state: {
        filePath: convertedFilePath,
        fileName: convertedFileName,
      },
    });
  };

  // View all videos
  const handleViewAllVideos = () => {
    navigate('/videos');
  };

  // Reset the flow
  const handleStartOver = () => {
    setCurrentStep(1);
    setDownloadedFilePath('');
    setDownloadedFileName('');
    setConvertedFilePath('');
    setConvertedFileName('');
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-background to-muted/30 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-tiktok-blue to-tiktok-red bg-clip-text text-transparent">
                  Media Conversion - Tiktok-Youtube
                </span>
              </h1>
              <p className="text-muted-foreground max-w-[600px]">
                Download, convert, and upload your TikTok videos to YouTube with professional quality and various format options.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className={`p-4 rounded-lg border border-border bg-card ${currentStep === 1 ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    1
                  </div>
                  <h2 className="font-semibold">Download</h2>
                </div>
                <p className="text-sm text-muted-foreground">Enter TikTok video URL to download</p>
              </div>
              
              <div className={`p-4 rounded-lg border border-border bg-card ${currentStep === 2 ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    2
                  </div>
                  <h2 className="font-semibold">Convert</h2>
                </div>
                <p className="text-sm text-muted-foreground">Choose conversion settings for YouTube format</p>
              </div>
              
              <div className={`p-4 rounded-lg border border-border bg-card ${currentStep === 3 ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    3
                  </div>
                  <h2 className="font-semibold">Upload</h2>
                </div>
                <p className="text-sm text-muted-foreground">Upload the converted video to YouTube</p>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto">
              {currentStep === 1 && (
                <DownloadForm onDownloadComplete={handleDownloadComplete} />
              )}
              
              {currentStep === 2 && (
                <ConversionForm 
                  filePath={downloadedFilePath}
                  fileName={downloadedFileName}
                  onConversionComplete={handleConversionComplete}
                />
              )}
              
              {currentStep === 3 && (
                <div className="flex flex-col space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6 text-center">
                    <Video className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Conversion Complete!</h3>
                    <p className="text-muted-foreground mb-4">
                      Your TikTok video has been successfully converted and is ready to be uploaded to YouTube.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={handleProceedToUpload} className="sm:flex-1">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload to YouTube
                      </Button>
                      <Button variant="outline" onClick={handleViewAllVideos} className="sm:flex-1">
                        <Video className="mr-2 h-4 w-4" />
                        View All Videos
                      </Button>
                      <Button variant="ghost" onClick={handleStartOver} className="sm:flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Convert Another Video
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        
        <section className="py-12 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Download TikTok Videos</h3>
                <p className="text-muted-foreground">
                  Download any TikTok video by simply pasting the URL.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Convert with Options</h3>
                <p className="text-muted-foreground">
                  Choose from multiple conversion presets optimized for YouTube.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Direct YouTube Upload</h3>
                <p className="text-muted-foreground">
                  Upload your converted videos directly to your YouTube channel.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Social Media converter. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
