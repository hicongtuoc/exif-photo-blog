/**
 * Google Drive Image Utilities
 * 
 * Helper functions to work with Google Drive images
 */

export interface GoogleDriveImage {
  url: string;
  filename: string;
  thumbnail: string;
  gallery: string;
  detail: string;
  fullHD: string;
  icon: string;
}

export type ImageSize = 'icon' | 'thumbnail' | 'gallery' | 'detail' | 'fullhd' | 'full';

/**
 * Parse Google Drive folder HTML and extract image URLs (Server-side)
 */
export async function parseGoogleDriveFolderServer(folderId: string): Promise<GoogleDriveImage[]> {
  const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Drive folder: ${response.statusText}`);
  }

  const html = await response.text();
  
  // Extract image URLs from HTML
  const urlPattern = /https:\/\/lh3\.googleusercontent\.com\/[^"'\s)]+/g;
  const matches = html.match(urlPattern) || [];
  
  // Remove duplicates
  const uniqueUrls = [...new Set(matches)];
  
  // Build image objects with size variants
  const images: GoogleDriveImage[] = uniqueUrls.map((url, index) => {
    const cleanUrl = url.replace(/=s\d+$/, '');
    
    return {
      url: cleanUrl,
      filename: `image-${index + 1}`,
      icon: `${cleanUrl}=s100`,
      thumbnail: `${cleanUrl}=s190`,
      gallery: `${cleanUrl}=s400`,
      detail: `${cleanUrl}=s800`,
      fullHD: `${cleanUrl}=s0`,
    };
  });

  return images;
}

/**
 * Fetch images from Google Drive folder (Client-side)
 * 
 * @param folderId - Google Drive folder ID
 * @param size - Optional size preset (default: 'all')
 * @returns Array of images with size variants
 */
export async function fetchGoogleDriveImages(
  folderId: string,
  size: ImageSize | 'all' = 'all'
): Promise<GoogleDriveImage[]> {
  const params = new URLSearchParams({ folderId });
  if (size !== 'all') {
    params.append('size', size);
  }

  const response = await fetch(`/api/google-drive?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Drive images: ${response.statusText}`);
  }

  const data = await response.json();
  return data.images;
}

/**
 * Get specific size URL from Google Drive image
 * 
 * @param image - Google Drive image object
 * @param size - Desired size
 * @returns URL for the specified size
 */
export function getGoogleDriveImageUrl(
  image: GoogleDriveImage,
  size: ImageSize
): string {
  switch (size) {
    case 'icon':
      return image.icon;
    case 'thumbnail':
      return image.thumbnail;
    case 'gallery':
      return image.gallery;
    case 'detail':
      return image.detail;
    case 'fullhd':
    case 'full':
      return image.fullHD;
    default:
      return image.gallery;
  }
}

/**
 * Create a custom size URL for Google Drive image
 * 
 * @param baseUrl - Base Google Drive URL
 * @param size - Size in pixels (use 0 for original size)
 * @returns URL with custom size parameter
 */
export function createCustomSizeUrl(baseUrl: string, size: number): string {
  const cleanUrl = baseUrl.replace(/=s\d+$/, '');
  return `${cleanUrl}=s${size}`;
}

/**
 * Extract folder ID from Google Drive URL
 * 
 * @param url - Google Drive folder URL
 * @returns Folder ID or null if not found
 */
export function extractFolderId(url: string): string | null {
  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
