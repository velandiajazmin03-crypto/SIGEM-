import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Cliente de Supabase con la service_role key. Solo debe usarse en código de
 * servidor (API routes, repositorios) — nunca se expone al navegador.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado (faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }
  client = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export const SIGEM_BUCKET = 'sigem-uploads';

let bucketEnsured = false;

/** Crea el bucket de Storage la primera vez que se necesita (idempotente). */
export async function ensureUploadBucket(): Promise<void> {
  if (bucketEnsured) return;
  const supabase = getSupabaseClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === SIGEM_BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(SIGEM_BUCKET, {
      public: true,
      fileSizeLimit: '5MB',
    });
    if (error && !/already exists/i.test(error.message)) {
      throw error;
    }
  }
  bucketEnsured = true;
}
