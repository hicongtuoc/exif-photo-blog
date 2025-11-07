// EXIF parsing removed - simplified image conversion only

interface ImageConversionOptions {
  maxSize: number
  quality: number
}

// Read a Blob/File as DataURL
const readAsDataURL = (blob: Blob): Promise<string> =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = () => rej(fr.error ?? new Error('FileReader error'));
    fr.readAsDataURL(blob);
  });

// Convert DataURL string -> Blob
const dataURLtoBlob = (dataURL: string): Blob => {
  const [header, b64] = dataURL.split(',');
  const mimeMatch = header.match(/data:([^;]+);base64/);
  if (!mimeMatch) throw new Error('Invalid data URL');
  const mime = mimeMatch[1];
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
};

// Draw onto a canvas, resize, and encode to JPEG Blob
const resizeToJpegBlob = async (
  source: ImageBitmap | HTMLImageElement,
  { maxSize, quality }: ImageConversionOptions,
): Promise<Blob> => {
  let w = source.width;
  let h = source.height;

  if (Math.max(w, h) > maxSize) {
    const scale = maxSize / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' });
  if (!ctx) throw new Error('2D context unavailable');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);

  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b as Blob), 'image/jpeg', quality),
  );
  if (!blob) throw new Error('canvas.toBlob failed');
  return blob;
};

/**
 * PNG File -> JPEG Blob, resized via canvas.toBlob()
 * (EXIF handling removed)
 */
export const pngToJpegWithExif = async (
  file: File,
  options: ImageConversionOptions,
): Promise<Blob> => {
  // Decode the PNG for drawing
  const img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  img.src = URL.createObjectURL(file);
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Image load failed'));
  });

  // Prefer ImageBitmap with orientation applied by decoder
  const bitmap = await createImageBitmap(
    img,
    { imageOrientation: 'from-image' },
  );

  // Resize on canvas -> JPEG Blob
  const jpegBlob = await resizeToJpegBlob(bitmap, options);

  // cleanup
  URL.revokeObjectURL(img.src);
  bitmap.close?.();

  return jpegBlob;
};

/**
 * JPEG File -> JPEG Blob, resized via canvas.toBlob()
 * (EXIF handling removed)
 */
export const jpgToJpegWithExif = async (
  file: File,
  options: ImageConversionOptions,
): Promise<Blob> => {
  // Decode the JPEG for drawing
  const img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  img.src = URL.createObjectURL(file);
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Image load failed'));
  });

  // Prefer ImageBitmap with orientation applied by decoder
  const bitmap = await createImageBitmap(
    img,
    { imageOrientation: 'from-image' },
  );

  // Resize on canvas -> JPEG Blob
  const jpegBlob = await resizeToJpegBlob(bitmap, options);

  // cleanup
  URL.revokeObjectURL(img.src);
  bitmap.close?.();

  return jpegBlob;
};
