import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// supabase is null until env vars are set (see .env.example / repo secrets).
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const supabaseReady = Boolean(supabase);

// Storage bucket names — created by supabase/schema.sql
export const BUCKETS = {
  participantPhotos: 'participant-photos',
  partnerDecks: 'partner-decks',
};

// Upload a FileList/array to a private bucket, return stored paths.
export async function uploadFiles(bucket, files) {
  const paths = [];
  for (const file of Array.from(files || [])) {
    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    const path = `${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    paths.push(path);
  }
  return paths;
}
