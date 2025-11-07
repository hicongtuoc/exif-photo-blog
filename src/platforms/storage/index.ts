import { LOCAL_FS_BASE_URL } from './local-fs-constants';

import {
  CURRENT_STORAGE,
  HAS_LOCAL_STORAGE,
} from '@/app/config';
import { generateNanoid } from '@/utility/nanoid';

export type StorageListItem = {
  url: string
  fileName: string
  uploadedAt?: Date
  size?: string
};

export type StorageListResponse = StorageListItem[];

export type StorageType = 'local-fs';

export const generateStorageId = () => generateNanoid(16);

export const generateFileNameWithId = (prefix: string) =>
  `${prefix}-${generateStorageId()}`;

export const getFileNamePartsFromStorageUrl = (url: string) => {
  const [
    _,
    urlBase = '',
    fileName = '',
    fileNameBase = '',
    fileId = '',
    fileExtension = '',
  ] = url.match(/^(.+)\/((-*[a-z0-9]+-*([a-z0-9-]+))\.([a-z]{1,4}))$/i) ?? [];
  return {
    urlBase,
    fileName,
    fileNameBase,
    fileId,
    fileExtension,
  };
};

export const labelForStorage = (type: StorageType): string => {
  return 'Local File System';
};

export const baseUrlForStorage = (type: StorageType) => {
  return LOCAL_FS_BASE_URL;
};

export const storageTypeFromUrl = (url: string): StorageType => {
  return 'local-fs';
};


export const uploadFromClientViaPresignedUrl = async (
  file: File | Blob,
  fileNameBase: string,
  extension: string,
  addRandomSuffix?: boolean,
) => {
  // For local storage, just return the expected URL
  const key = addRandomSuffix
    ? `${fileNameBase}-${generateStorageId()}.${extension}`
    : `${fileNameBase}.${extension}`;

  return `${baseUrlForStorage(CURRENT_STORAGE)}/${key}`;
};

// Server-only functions - re-exported from ./server.ts
export { 
  uploadFileFromClient, 
  putFile, 
  copyFile, 
  deleteFile, 
  getStorageUrlsForPrefix 
} from './server';

export const deleteFilesWithPrefix = async (prefix: string) => {
  const { getStorageUrlsForPrefix, deleteFile } = await import('./server');
  const urls = await getStorageUrlsForPrefix(prefix);
  return Promise.all(urls.map(({ url }) => deleteFile(url)));
};

export const moveFile = async (
  originUrl: string,
  destinationFileName: string,
) => {
  const { copyFile, deleteFile } = await import('./server');
  const url = await copyFile(originUrl, destinationFileName);
  // If successful, delete original file
  if (url) { await deleteFile(originUrl); }
  return url;
};

export const testStorageConnection = async () => {
  const { getStorageUrlsForPrefix } = await import('./server');
  return getStorageUrlsForPrefix();
};
