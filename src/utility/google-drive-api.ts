/**
 * Google Drive API Integration
 * 
 * Alternative approach using Google Drive API v3
 * Requires API key from Google Cloud Console
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
}

/**
 * Fetch files from Google Drive folder using API
 * 
 * @param folderId - Google Drive folder ID
 * @param apiKey - Google API key (optional, uses env variable if not provided)
 */
export async function fetchDriveFilesWithAPI(
  folderId: string,
  apiKey?: string
): Promise<DriveFile[]> {
  const key = apiKey || process.env.GOOGLE_DRIVE_API_KEY;
  
  if (!key) {
    throw new Error('Google Drive API key is required');
  }

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and mimeType contains 'image/'`,
    key,
    fields: 'files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink)',
    pageSize: '100',
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Google Drive API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Get direct download link for a file
 */
export function getDirectDownloadLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Get thumbnail link with custom size
 */
export function getThumbnailLink(fileId: string, size: number = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`;
}

/**
 * Convert Drive file to image URLs with different sizes
 */
export function driveFileToImageUrls(file: DriveFile) {
  return {
    id: file.id,
    filename: file.name,
    icon: getThumbnailLink(file.id, 100),
    thumbnail: getThumbnailLink(file.id, 190),
    gallery: getThumbnailLink(file.id, 400),
    detail: getThumbnailLink(file.id, 800),
    fullHD: getThumbnailLink(file.id, 2048),
    download: getDirectDownloadLink(file.id),
    viewLink: file.webViewLink,
  };
}
