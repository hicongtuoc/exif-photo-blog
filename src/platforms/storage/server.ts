// Server-only storage functions
'use server';

import type { StorageListResponse } from './index';

export const uploadFileFromClient = async (
  file: File | Blob,
  fileNameBase: string,
  extension: string,
) => {
  const { localFsUploadFromClient } = await import('./local-fs');
  return localFsUploadFromClient(file, `${fileNameBase}.${extension}`);
};

export const putFile = async (
  file: Buffer,
  fileName: string,
) => {
  const { localFsPut } = await import('./local-fs');
  return localFsPut(file, fileName);
};

export const copyFile = async (
  originUrl: string,
  destinationFileName: string,
): Promise<string> => {
  const { localFsCopy } = await import('./local-fs');
  return localFsCopy(originUrl, destinationFileName, false);
};

export const deleteFile = async (url: string) => {
  const { localFsDelete } = await import('./local-fs');
  return localFsDelete(url);
};

export const getStorageUrlsForPrefix = async (prefix = ''): Promise<StorageListResponse> => {
  const urls: StorageListResponse = [];

  const { localFsList } = await import('./local-fs');
  urls.push(...await localFsList(prefix).catch(() => []));

  return urls.sort((a, b) => {
    if (!a.uploadedAt) { return 1; }
    if (!b.uploadedAt) { return -1; }
    return b.uploadedAt.getTime() - a.uploadedAt.getTime();
  });
};
