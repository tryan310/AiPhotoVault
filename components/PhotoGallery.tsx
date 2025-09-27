import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { TrashIcon, DownloadIcon, EyeIcon } from './icons';

interface Photo {
  id: number;
  theme: string;
  generated_images: string[];
  credits_used: number;
  created_at: string;
}

interface PhotoGalleryProps {
  onBack: () => void;
  onGenerateMore?: () => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onBack, onGenerateMore }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        throw new Error('Please log in to view your photos');
      }
      
      const response = await fetch('/api/photos', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`Failed to load photos (${response.status})`);
      }

      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      setError('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo set?')) {
      return;
    }

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Remove from local state
      setPhotos(photos.filter(photo => photo.id !== photoId));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError('Failed to delete photo');
    }
  };

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      // Fallback to simple date format if locale formatting fails
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your photos...</p>
        </div>
      </div>
    );
  }

  if (selectedPhoto) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="w-full max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              ← Back to PhotoVault
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => deletePhoto(selectedPhoto.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">Theme: {selectedPhoto.theme}</h2>
            <p className="text-gray-400 mb-4">
              Generated on {formatDate(selectedPhoto.created_at)} • {selectedPhoto.credits_used} credits used
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedPhoto.generated_images.map((image, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Generated photo ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <button
                    onClick={() => downloadImage(image, `ai-photo-${selectedPhoto.id}-${index + 1}.png`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Your Photo Vault</h1>
            <p className="text-gray-400 mt-2">All your AI-generated photos</p>
          </div>
          <div className="flex gap-3">
            {onGenerateMore && (
              <button
                onClick={onGenerateMore}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Generate More Photos
              </button>
            )}
            <button
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {photos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No photos yet</div>
            <p className="text-gray-500">Generate some AI photos to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{photo.theme}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {formatDate(photo.created_at)} • {photo.credits_used} credits
                  </p>
                </div>
                
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {photo.generated_images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View All
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition duration-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
