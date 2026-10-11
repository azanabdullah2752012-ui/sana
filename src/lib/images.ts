// Image & Screenshot handling for Sana & Me chat

export interface ImageMessageInfo {
  isImage: boolean;
  imageUrl?: string;
  caption?: string;
}

// Encode image with optional caption
export function encodeImageMessage(imageUrl: string, caption?: string): string {
  const cleanCap = (caption || '').trim();
  if (!cleanCap) {
    return `[image:${imageUrl.trim()}]`;
  }
  return `[image:${imageUrl.trim()}:${encodeURIComponent(cleanCap)}]`;
}

// Parse image message
export function parseImageMessage(content: string): ImageMessageInfo {
  if (!content) return { isImage: false };

  // Match [image:url:encodedCaption]
  const matchWithCap = content.match(/^\[image:(data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^:]+):([^\]]+)\]$/);
  if (matchWithCap) {
    return {
      isImage: true,
      imageUrl: matchWithCap[1],
      caption: decodeURIComponent(matchWithCap[2]),
    };
  }

  // Match [image:url]
  const matchNoCap = content.match(/^\[image:(data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^\]]+)\]$/);
  if (matchNoCap) {
    return {
      isImage: true,
      imageUrl: matchNoCap[1],
      caption: '',
    };
  }

  // Raw base64 data URL fallback
  if (content.startsWith('data:image/')) {
    return {
      isImage: true,
      imageUrl: content,
      caption: '',
    };
  }

  return { isImage: false };
}

// Client-side image compression for screenshot pasting and uploads
// Resizes to max dimension (e.g. 1440px) and compresses to lightweight WebP/JPEG
export function compressImageFile(file: File | Blob, maxDim = 1440, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Smooth image downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
