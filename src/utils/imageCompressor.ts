/**
 * Client-Side Image Compression & Optimization Utility
 * 
 * - Handles EXIF orientation (iPhone camera rotation) via createImageBitmap
 * - Converts raw 4MB-12MB camera captures into ~120KB-180KB WebP
 * - Prevents Safari/mobile memory crashes with proper ObjectURL revocation
 * - Graceful fallback to JPEG if WebP canvas encoding is unsupported
 */

export interface CompressionOptions {
  maxDimension?: number;
  quality?: number;
}

export async function compressImageToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const maxDim = options.maxDimension || 1200;
  const quality = options.quality ?? 0.82;

  // If not an image file (e.g. video), throw so caller handles it
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image file');
  }

  // 1. Try modern createImageBitmap with native EXIF orientation correction
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' as any });
      let { width, height } = bitmap;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // High quality downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        // Attempt WebP first
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        return dataUrl;
      }
    } catch {
      // Fallback to standard Image loading if createImageBitmap encounters an unusual codec
    }
  }

  // 2. Fallback: Image object with URL.createObjectURL (handles EXIF via browser default)
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Absolute fallback to DataURL read
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      let dataUrl = canvas.toDataURL('image/webp', quality);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(dataUrl);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to raw FileReader so user's image is not lost
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(err);
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
