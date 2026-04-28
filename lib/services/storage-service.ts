/**
 * StorageService
 *
 * Uploads files to Supabase Storage (haambucket) when credentials are present,
 * falls back to local filesystem for development.
 *
 * Bucket structure in Supabase:
 *   haambucket/
 *     avatars/
 *     pitchdecks/
 *     reports/
 *     submissions/
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export type StorageFolder = 'avatars' | 'pitchdecks' | 'reports' | 'submissions';

const SUPABASE_BUCKET = 'haambucket';

// Local filesystem folder mapping
const LOCAL_FOLDER_MAP: Record<StorageFolder, string> = {
  avatars: 'avatars',
  pitchdecks: 'pitchdecks',
  reports: 'reports',
  submissions: 'milestone-submissions',
};

export interface UploadResult {
  url: string;
  path: string;   // full path inside bucket, e.g. "avatars/filename.jpg"
  folder: StorageFolder;
  provider: 'supabase' | 'local';
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const StorageService = {
  /**
   * Upload a file buffer to Supabase Storage (or local filesystem in dev).
   *
   * @param folder      - Target folder inside haambucket
   * @param filename    - Filename only (no path prefix), e.g. "avatar-123.jpg"
   * @param buffer      - File content as Buffer
   * @param contentType - MIME type
   */
  async upload(
    folder: StorageFolder,
    filename: string,
    buffer: Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const supabase = getSupabaseClient();
    if (supabase) {
      return StorageService._uploadToSupabase(supabase, folder, filename, buffer, contentType);
    }
    return StorageService._uploadToLocal(folder, filename, buffer);
  },

  async _uploadToSupabase(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    folder: StorageFolder,
    filename: string,
    buffer: Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const path = `${folder}/${filename}`;

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      throw new Error(`Supabase upload failed [${folder}/${filename}]: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(path);

    return { url: urlData.publicUrl, path, folder, provider: 'supabase' };
  },

  async _uploadToLocal(
    folder: StorageFolder,
    filename: string,
    buffer: Buffer
  ): Promise<UploadResult> {
    const localFolder = LOCAL_FOLDER_MAP[folder];
    const uploadDir = join(process.cwd(), 'public', 'uploads', localFolder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    const url = `/uploads/${localFolder}/${filename}`;
    return { url, path: filename, folder, provider: 'local' };
  },

  /**
   * Delete a file from storage.
   * @param path - Full path inside bucket, e.g. "avatars/file.jpg"
   */
  async delete(path: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
    if (error) {
      console.error(`[StorageService] delete failed (${path}):`, error.message);
    }
  },

  isSupabaseEnabled(): boolean {
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
};
