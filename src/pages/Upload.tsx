
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import UploadForm from '@/components/UploadForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Search } from 'lucide-react';

const Upload = () => {
  const { isAuthenticated, loading, isYouTubeConnected } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filePath, setFilePath] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Get file info from location state
  useEffect(() => {
    if (location.state && location.state.filePath && location.state.fileName) {
      setFilePath(location.state.filePath);
      setFileName(location.state.fileName);
    }
  }, [location.state]);

  // Handle upload completion
  const handleUploadComplete = () => {
    navigate('/videos', { state: { tab: 'converted' } });
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold">Upload to YouTube</h1>
          <p className="text-muted-foreground">
            Upload your converted videos directly to your YouTube channel
          </p>
        </div>
        
        {!filePath ? (
          <div className="py-12 text-center border rounded-lg">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Video Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a converted video to upload to YouTube
            </p>
            <Button onClick={() => navigate('/videos', { state: { tab: 'converted' } })}>
              Browse Converted Videos
            </Button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <UploadForm
              filePath={filePath}
              fileName={fileName}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}
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

export default Upload;
