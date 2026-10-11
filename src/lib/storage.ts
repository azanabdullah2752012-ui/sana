import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = 'memory-images';

/**
 * Uploads an image to Supabase Storage in the private bucket 'memory-images'.
 * If Supabase is not configured (demo mode), it returns a client-side Data URL.
 */
export async function uploadMemoryImage(file: File): Promise<string> {
  // Demo / local fallback: convert to base64 Data URL so it previews immediately
  if (!isSupabaseConfigured()) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `memories/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Create a signed URL valid for 7 days (604800 seconds)
  // Keeps the bucket strictly private while allowing authorized app viewing
  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 604800);

  if (signedError || !signedData?.signedUrl) {
    throw new Error(`Failed to generate secure URL: ${signedError?.message}`);
  }

  return signedData.signedUrl;
}
