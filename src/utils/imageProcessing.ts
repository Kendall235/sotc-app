const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.8;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ProcessedImage {
  base64: string;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
}

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export function validateFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new ImageProcessingError('Please upload an image file');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ImageProcessingError('File size must be under 10MB');
  }
}

export async function processImage(file: File): Promise<ProcessedImage> {
  validateFile(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const result = resizeAndCompress(img, file.size);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new ImageProcessingError('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new ImageProcessingError('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

function resizeAndCompress(img: HTMLImageElement, originalSize: number): ProcessedImage {
  const { width, height } = calculateDimensions(img.width, img.height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ImageProcessingError('Failed to create canvas context');
  }

  // Use better image rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to JPEG base64
  const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

  // Calculate approximate size of base64 data
  const processedSize = Math.ceil((base64.length - 'data:image/jpeg;base64,'.length) * 0.75);

  return {
    base64,
    width,
    height,
    originalSize,
    processedSize,
  };
}

function calculateDimensions(width: number, height: number): { width: number; height: number } {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { width, height };
  }

  const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new ImageProcessingError('Failed to create preview'));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
