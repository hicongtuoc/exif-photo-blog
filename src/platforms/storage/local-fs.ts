// Server-only file storage implementation
import { promises as fs } from 'fs';
import { join } from 'path';
import { getFileNamePartsFromStorageUrl, StorageListResponse } from '.';
import { formatBytes } from '@/utility/number';
import { LOCAL_FS_BASE_URL } from './local-fs-constants';

// Re-export for convenience
export { LOCAL_FS_BASE_URL };

// Store files in public/uploads directory
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
};

export const isUrlFromLocalFs = (url?: string) =>
  url?.startsWith(LOCAL_FS_BASE_URL) || url?.startsWith('/uploads');

export const localFsUploadFromClient = async (
  file: File | Blob,
  fileName: string,
): Promise<string> => {
  await ensureUploadsDir();
  
  // Convert Blob/File to Buffer and write to file system
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const filePath = join(UPLOADS_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  
  return `${LOCAL_FS_BASE_URL}/${fileName}`;
};

export const localFsPut = async (
  file: Buffer,
  fileName: string,
): Promise<string> => {
  await ensureUploadsDir();
  const filePath = join(UPLOADS_DIR, fileName);
  await fs.writeFile(filePath, file);
  return `${LOCAL_FS_BASE_URL}/${fileName}`;
};

export const localFsCopy = async (
  sourceUrl: string,
  destinationFileName: string,
  addRandomSuffix?: boolean,
): Promise<string> => {
  await ensureUploadsDir();
  
  const { fileName: sourceFileName } = getFileNamePartsFromStorageUrl(sourceUrl);
  const sourcePath = join(UPLOADS_DIR, sourceFileName);
  
  const finalFileName = addRandomSuffix
    ? `${destinationFileName}-${Date.now()}`
    : destinationFileName;
  
  const destPath = join(UPLOADS_DIR, finalFileName);
  
  await fs.copyFile(sourcePath, destPath);
  return `${LOCAL_FS_BASE_URL}/${finalFileName}`;
};

export const localFsDelete = async (url: string) => {
  const { fileName } = getFileNamePartsFromStorageUrl(url);
  const filePath = join(UPLOADS_DIR, fileName);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore error if file doesn't exist
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
};

export const localFsList = async (
  prefix: string,
): Promise<StorageListResponse> => {
  try {
    await ensureUploadsDir();
    
    const files = await fs.readdir(UPLOADS_DIR);
    const fileStats = await Promise.all(
      files
        .filter(file => !prefix || file.startsWith(prefix))
        .map(async (file) => {
          const filePath = join(UPLOADS_DIR, file);
          const stats = await fs.stat(filePath);
          return {
            url: `${LOCAL_FS_BASE_URL}/${file}`,
            fileName: file,
            uploadedAt: stats.mtime,
            size: formatBytes(stats.size),
          };
        })
    );
    
    return fileStats;
  } catch (error) {
    console.error('Error listing local files:', error);
    return [];
  }
};
