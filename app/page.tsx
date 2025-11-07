import { generateOgImageMetaForPhotos } from '@/photo';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { Metadata } from 'next/types';
import { cache } from 'react';
import { getPhotos } from '@/photo/query';
import { GRID_HOMEPAGE_ENABLED, USER_DEFAULT_SORT_OPTIONS } from '@/app/config';
import { NULL_CATEGORY_DATA } from '@/category/data';
import PhotoFullPage from '@/photo/PhotoFullPage';
import PhotoGridPage from '@/photo/PhotoGridPage';
import { getDataForCategoriesCached } from '@/category/cache';
import { getPhotosMetaCached } from '@/photo/cache';
import { FEED_META_QUERY_OPTIONS, getFeedQueryOptions } from '@/feed';
import { parseGoogleDriveFolderServer } from '@/utility/google-drive';
import { convertGoogleDriveImagesToPhotos } from '@/utility/google-drive-adapter';

// Google Drive folder ID - thay đổi ID này để hiển thị ảnh từ folder khác
const GOOGLE_DRIVE_FOLDER_ID = '1Twox6YsD_VyH_mHCivskyEtlAUK_uYna';
// Đặt USE_GOOGLE_DRIVE = true để dùng Google Drive, false để dùng photos từ database
const USE_GOOGLE_DRIVE = true;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const getPhotosCached = cache(() => getPhotos(getFeedQueryOptions({
  isGrid: GRID_HOMEPAGE_ENABLED,
})));

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotosCached()
    .catch(() => []);
  return generateOgImageMetaForPhotos(photos);
}

export default async function HomePage() {
  // Nếu dùng Google Drive, fetch và convert sang Photo format
  if (USE_GOOGLE_DRIVE && GOOGLE_DRIVE_FOLDER_ID) {
    try {
      const googleDriveImages = await parseGoogleDriveFolderServer(GOOGLE_DRIVE_FOLDER_ID);
      const photos = convertGoogleDriveImagesToPhotos(googleDriveImages);
      
      if (photos.length === 0) {
        return <PhotosEmptyState />;
      }

      const categories = GRID_HOMEPAGE_ENABLED
        ? await getDataForCategoriesCached()
        : NULL_CATEGORY_DATA;

      return GRID_HOMEPAGE_ENABLED
        ? <PhotoGridPage
          {...{
            photos,
            photosCount: photos.length,
            photosCountWithExcludes: photos.length,
            ...USER_DEFAULT_SORT_OPTIONS,
            ...categories,
          }}
        />
        : <PhotoFullPage {...{
          photos,
          photosCount: photos.length,
          ...USER_DEFAULT_SORT_OPTIONS,
        }} />;
    } catch (error) {
      console.error('Error loading Google Drive images:', error);
      // Fallback to empty state on error
      return <PhotosEmptyState />;
    }
  }

  // Còn không thì dùng photos từ database như cũ
  const [
    photos,
    photosCount,
    photosCountWithExcludes,
    categories,
  ] = await Promise.all([
    getPhotosCached()
      .catch(() => []),
    getPhotosMetaCached(FEED_META_QUERY_OPTIONS)
      .then(({ count }) => count)
      .catch(() => 0),
    getPhotosMetaCached()
      .then(({ count }) => count)
      .catch(() => 0),
    GRID_HOMEPAGE_ENABLED
      ? getDataForCategoriesCached()
      : NULL_CATEGORY_DATA,
  ]);

  return (
    photos.length > 0
      ? GRID_HOMEPAGE_ENABLED
        ? <PhotoGridPage
          {...{
            photos,
            photosCount,
            photosCountWithExcludes,
            ...USER_DEFAULT_SORT_OPTIONS,
            ...categories,
          }}
        />
        : <PhotoFullPage {...{
          photos,
          photosCount,
          ...USER_DEFAULT_SORT_OPTIONS,
        }} />
      : <PhotosEmptyState />
  );
}
