import { unstable_noStore } from 'next/cache';
import { getStorageUrlsForPrefix } from '.';

export const getStorageUploadUrlsNoStore = async () => {
  unstable_noStore();
  return getStorageUrlsForPrefix('upload');
};

export const getStoragePhotoUrlsNoStore = async () => {
  unstable_noStore();
  return getStorageUrlsForPrefix('photo');
};
