'use client';

import { useState } from 'react';
import { fetchGoogleDriveImages, type GoogleDriveImage, type ImageSize } from '@/utility/google-drive';
import Image from 'next/image';

export default function GoogleDriveDemoPage() {
  const [folderId, setFolderId] = useState('1Twox6YsD_VyH_mHCivskyEtlAUK_uYna');
  const [images, setImages] = useState<GoogleDriveImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ImageSize>('gallery');

  const handleFetchImages = async () => {
    if (!folderId.trim()) {
      setError('Please enter a folder ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedImages = await fetchGoogleDriveImages(folderId);
      console.log('Fetched images:', fetchedImages);
      
      if (fetchedImages.length === 0) {
        setError('No images found. The folder might be empty or private.');
      }
      
      setImages(fetchedImages);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: GoogleDriveImage): string => {
    console.log('Image object:', image);
    console.log('Selected size:', selectedSize);
    
    let url = '';
    switch (selectedSize) {
      case 'icon':
        url = image.icon || image.url;
        break;
      case 'thumbnail':
        url = image.thumbnail || image.url;
        break;
      case 'gallery':
        url = image.gallery || image.url;
        break;
      case 'detail':
        url = image.detail || image.url;
        break;
      case 'fullhd':
      case 'full':
        url = image.fullHD || image.url;
        break;
      default:
        url = image.gallery || image.url;
    }
    
    console.log('Returning URL:', url);
    return url || 'https://via.placeholder.com/400?text=No+Image';
  };

  const getSizeLabel = (size: ImageSize): string => {
    const labels: Record<ImageSize, string> = {
      icon: 'Icon (100px)',
      thumbnail: 'Thumbnail (190px)',
      gallery: 'Gallery (400px)',
      detail: 'Detail (800px)',
      fullhd: 'Full HD/4K (Original)',
      full: 'Full (Original)',
    };
    return labels[size];
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Google Drive Image Viewer
        </h1>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            {/* Folder ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Drive Folder ID
              </label>
              <input
                type="text"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="Enter Google Drive folder ID"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Size Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Size
              </label>
              <div className="flex flex-wrap gap-2">
                {(['icon', 'thumbnail', 'gallery', 'detail', 'fullhd'] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getSizeLabel(size)}
                  </button>
                ))}
              </div>
            </div>

            {/* Fetch Button */}
            <div className="flex gap-2">
              <button
                onClick={handleFetchImages}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Fetch Images'}
              </button>
              
              <a
                href={`/api/google-drive-debug?folderId=${folderId}`}
                target="_blank"
                className="px-6 py-3 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors text-center"
              >
                Debug
              </a>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Images ({images.length}) - {getSizeLabel(selectedSize)}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative">
                    <img
                      src={getImageUrl(image)}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={image.filename}>
                      {image.filename}
                    </p>
                    
                    {/* Size URLs */}
                    <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-900 dark:hover:text-gray-200">
                          View all sizes
                        </summary>
                        <div className="mt-2 space-y-1 pl-2">
                          <div><strong>Icon:</strong> {image.icon}</div>
                          <div><strong>Thumbnail:</strong> {image.thumbnail}</div>
                          <div><strong>Gallery:</strong> {image.gallery}</div>
                          <div><strong>Detail:</strong> {image.detail}</div>
                          <div><strong>Full HD:</strong> {image.fullHD}</div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            How to use
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>⚠️ Important:</strong> Folder phải được share public (Anyone with the link can view)
            </p>
            <p>
              <strong>API Endpoint:</strong> <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">/api/google-drive?folderId=YOUR_FOLDER_ID</code>
            </p>
            <p>
              <strong>Debug Endpoint:</strong> <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">/api/google-drive-debug?folderId=YOUR_FOLDER_ID</code>
            </p>
            <p>
              <strong>Image Sizes:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Icon (s100):</strong> 100px - For thumbnails and icons</li>
              <li><strong>Thumbnail (s190):</strong> 190px - Default Drive thumbnail</li>
              <li><strong>Gallery (s400):</strong> 400px - Gallery view</li>
              <li><strong>Detail (s800):</strong> 800px - Detail/preview view</li>
              <li><strong>Full HD/4K (s0):</strong> Original size - Full resolution</li>
            </ul>
            
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">Troubleshooting:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Click <strong>Debug</strong> button to see actual HTML and URLs</li>
                <li>• Make sure folder is publicly shared</li>
                <li>• Check browser console for errors</li>
                <li>• If embedded view doesn't work, consider using Google Drive API instead</li>
              </ul>
            </div>
            <p className="mt-3">
              <strong>Example Usage:</strong>
            </p>
            <pre className="bg-white dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`// Fetch all images with all size variants
const images = await fetchGoogleDriveImages('YOUR_FOLDER_ID');

// Fetch images with specific size
const galleryImages = await fetchGoogleDriveImages('YOUR_FOLDER_ID', 'gallery');

// Use in component
<img src={images[0].gallery} alt={images[0].filename} />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
