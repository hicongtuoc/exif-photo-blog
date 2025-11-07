'use client';

import { useState, useEffect } from 'react';
import { fetchGoogleDriveImages, type GoogleDriveImage } from '@/utility/google-drive';
import Image from 'next/image';

interface GoogleDriveGalleryProps {
  folderId: string;
  columns?: number;
  imageSize?: 'icon' | 'thumbnail' | 'gallery' | 'detail' | 'fullhd';
  className?: string;
}

export default function GoogleDriveGallery({
  folderId,
  columns = 4,
  imageSize = 'thumbnail',
  className = '',
}: GoogleDriveGalleryProps) {
  const [images, setImages] = useState<GoogleDriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedImages = await fetchGoogleDriveImages(folderId);
        
        if (fetchedImages.length === 0) {
          setError('No images found in the Google Drive folder.');
        }
        
        setImages(fetchedImages);
      } catch (err) {
        console.error('Error fetching Google Drive images:', err);
        setError('Failed to load images from Google Drive');
      } finally {
        setLoading(false);
      }
    };

    if (folderId) {
      loadImages();
    }
  }, [folderId]);

  const getImageUrl = (image: GoogleDriveImage): string => {
    switch (imageSize) {
      case 'icon':
        return image.icon || image.url;
      case 'thumbnail':
        return image.thumbnail || image.url;
      case 'gallery':
        return image.gallery || image.url;
      case 'detail':
        return image.detail || image.url;
      case 'fullhd':
        return image.fullHD || image.url;
      default:
        return image.thumbnail || image.url;
    }
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading images from Google Drive...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center space-y-3 max-w-md">
          <div className="text-red-600 dark:text-red-400 text-5xl">⚠️</div>
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Make sure the Google Drive folder is publicly shared and contains images.
          </p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center space-y-3">
          <div className="text-gray-400 text-5xl">📁</div>
          <p className="text-gray-600 dark:text-gray-400">No images found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={`grid ${gridCols} gap-4`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={getImageUrl(image)}
                alt={image.filename}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-medium truncate" title={image.filename}>
                {image.filename}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
