import { supabase } from './supabase';

const BUCKET_NAME = 'memory-images';

/**
 * Uploads an image to Supabase Storage in the private bucket 'memory-images'.
 * If Supabase storage is unavailable or bucket is not created, seamlessly falls back
 * to a base64 Data URL so the user can always upload pictures without errors.
 */
export async function uploadMemoryImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `memories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!uploadError) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 604800);

      if (!signedError && signedData?.signedUrl) {
        return signedData.signedUrl;
      }
    }
  } catch (err) {
    console.warn('Storage upload error, using direct image data:', err);
  }

  // Resilient fallback: convert to Data URL so photo uploads always succeed
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
