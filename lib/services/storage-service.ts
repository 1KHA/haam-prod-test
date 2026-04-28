/**
 * StorageService
 *
 * Uploads files to Supabase Storage when credentials are present,
 * falls back to local filesystem for development without Supabase.
 *
 * Buckets used (create these in Supabase Dashboard → Storage as PUBLIC):
 *   - avatars
 *   - pitchdecks
 *   - reports
 *   - submissions
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export type StorageBucket = 'avatars' | 'pitchdecks' | 'reports' | 'submissions';

export interface UploadResult {
  url: string;
  path: string;
  bucket: StorageBucket;
  provider: 'supabase' | 'local';
}

// Singleton Supabase client — only created when env vars are present
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const StorageService = {
  /**
   * Upload a file buffer to the configured storage provider.
   * Returns a publicly accessible URL and metadata.
   *
   * @param bucket  - Supabase bucket name (must exist and be public)
   * @param path    - Object path within bucket, e.g. "userId/filename.jpg"
   * @param buffer  - File content as Buffer
   * @param contentType - MIME type, e.g. "image/jpeg"
   */
  async upload(
    bucket: StorageBucket,
    path: string,
    buffer: Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const supabase = getSupabaseClient();

    if (supabase) {
      return StorageService._uploadToSupabase(supabase, bucket, path, buffer, contentType);
    }

    return StorageService._uploadToLocal(bucket, path, buffer);
  },

  async _uploadToSupabase(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    bucket: StorageBucket,
    path: string,
    buffer: Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Supabase storage upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    return { url: publicUrl, path, bucket, provider: 'supabase' };
  },

  async _uploadToLocal(
    bucket: StorageBucket,
    path: string,
    buffer: Buffer
  ): Promise<UploadResult> {
    // Map bucket → local subfolder
    const folderMap: Record<StorageBucket, string> = {
      avatars: 'avatars',
      pitchdecks: 'pitchdecks',
      reports: 'reports',
      submissions: 'milestone-submissions',
    };

    const folder = folderMap[bucket];
    const fileName = path.split('/').pop() || path;
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), buffer);

    const url = `/uploads/${folder}/${fileName}`;
    return { url, path: fileName, bucket, provider: 'local' };
  },

  /**
   * Delete a file from storage.
   * path should be the object path within the bucket (not the full URL).
   */
  async delete(bucket: StorageBucket, path: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return; // local files not cleaned up automatically

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error(`[StorageService] delete failed for ${bucket}/${path}:`, error.message);
    }
  },

  /** Returns true when Supabase storage is configured and active. */
  isSupabaseEnabled(): boolean {
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
};
