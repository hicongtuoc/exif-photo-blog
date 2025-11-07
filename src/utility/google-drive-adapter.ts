import { Photo } from '@/photo';
import { GoogleDriveImage } from './google-drive';

/**
 * Convert Google Drive images to Photo format for PhotoGridPage
 */
export function convertGoogleDriveImageToPhoto(
  image: GoogleDriveImage,
  index: number,
): Photo {
  // Generate a unique ID based on the image URL
  const id = `gdrive-${image.url.split('/').pop()?.split('=')[0] || index}`;
  
  // Use fullHD (s0 - original size) for detail view
  // Grid will use thumbnail via ImageMedium component
  const url = image.fullHD || image.url;
  
  // Create a minimal Photo object with required fields
  const now = new Date();
  
  return {
    id,
    url,
    extension: 'jpg', // Assume JPG for Google Drive images
    aspectRatio: 1, // Default to square, Google Drive doesn't provide this
    blurData: undefined,
    title: undefined,
    caption: image.filename,
    semanticDescription: undefined,
    tags: [],
    make: undefined,
    model: undefined,
    focalLength: undefined,
    focalLengthIn35MmFormat: undefined,
    focalLengthFormatted: undefined,
    focalLengthIn35MmFormatFormatted: undefined,
    lensMake: undefined,
    lensModel: undefined,
    fNumber: undefined,
    fNumberFormatted: undefined,
    iso: undefined,
    isoFormatted: undefined,
    exposureTime: undefined,
    exposureTimeFormatted: undefined,
    exposureCompensation: undefined,
    exposureCompensationFormatted: undefined,
    latitude: undefined,
    longitude: undefined,
    locationName: undefined,
    film: undefined,
    recipeTitle: undefined,
    recipeData: undefined,
    colorData: undefined,
    colorSort: undefined,
    priorityOrder: index,
    excludeFromFeeds: false,
    hidden: false,
    takenAt: now,
    takenAtNaive: now.toISOString().split('T')[0],
    takenAtNaiveFormatted: now.toLocaleDateString(),
    updatedAt: now,
    createdAt: now,
  };
}

/**
 * Convert array of Google Drive images to Photo array
 */
export function convertGoogleDriveImagesToPhotos(
  images: GoogleDriveImage[],
): Photo[] {
  return images.map((image, index) => 
    convertGoogleDriveImageToPhoto(image, index)
  );
}
