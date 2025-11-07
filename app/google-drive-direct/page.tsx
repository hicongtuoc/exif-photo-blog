'use client';

import { useState } from 'react';

interface DirectImageConfig {
  id: string;
  filename: string;
}

export default function DirectGoogleDriveTest() {
  const [images, setImages] = useState<DirectImageConfig[]>([
    // Thêm file IDs trực tiếp ở đây
    // Format: File ID từ Google Drive
  ]);
  
  const [fileId, setFileId] = useState('');
  const [filename, setFilename] = useState('');

  const addImage = () => {
    if (fileId && filename) {
      setImages([...images, { id: fileId, filename }]);
      setFileId('');
      setFilename('');
    }
  };

  const getImageUrl = (fileId: string, size: number) => {
    // Direct Google Drive thumbnail URL
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`;
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Direct Google Drive Image Test
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Image by File ID</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                File ID (from Google Drive URL)
              </label>
              <input
                type="text"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                placeholder="e.g., 1ABCDef..."
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Filename
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., photo.jpg"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <button
              onClick={addImage}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Image
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-sm"><strong>How to get File ID:</strong></p>
            <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
              <li>Open file in Google Drive</li>
              <li>Click "Get link" or "Share"</li>
              <li>Copy the URL: https://drive.google.com/file/d/<strong>FILE_ID</strong>/view</li>
              <li>Paste the FILE_ID above</li>
            </ol>
          </div>
        </div>

        {images.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Images ({images.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={getImageUrl(img.id, 400)}
                      alt={img.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.border = '2px solid red';
                        console.error('Failed to load:', img.id);
                      }}
                    />
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-medium truncate" title={img.filename}>
                      {img.filename}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      ID: {img.id}
                    </p>

                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600">
                        All sizes
                      </summary>
                      <div className="mt-2 space-y-1 text-xs">
                        <div><strong>Icon (100):</strong> <a href={getImageUrl(img.id, 100)} target="_blank" className="text-blue-600">View</a></div>
                        <div><strong>Thumbnail (190):</strong> <a href={getImageUrl(img.id, 190)} target="_blank" className="text-blue-600">View</a></div>
                        <div><strong>Gallery (400):</strong> <a href={getImageUrl(img.id, 400)} target="_blank" className="text-blue-600">View</a></div>
                        <div><strong>Detail (800):</strong> <a href={getImageUrl(img.id, 800)} target="_blank" className="text-blue-600">View</a></div>
                        <div><strong>Full (2048):</strong> <a href={getImageUrl(img.id, 2048)} target="_blank" className="text-blue-600">View</a></div>
                      </div>
                    </details>

                    <button
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
