import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabaseClient, isSupabaseConfigured, ensureUploadBucket, SIGEM_BUCKET } from '@/lib/supabaseClient';

const CATEGORIES = ['equipos', 'fallas', 'mantenimientos'] as const;
type Category = (typeof CATEGORIES)[number];

const ALLOWED_TYPES: Record<Category, string[]> = {
  equipos: ['image/png', 'image/jpeg', 'image/webp'],
  fallas: ['image/png', 'image/jpeg', 'image/webp'],
  mantenimientos: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, igual al límite del bucket

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(-80);
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'La subida de archivos requiere Supabase configurado en el servidor.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const category = formData.get('category');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo no válido.' }, { status: 400 });
    }
    if (typeof category !== 'string' || !CATEGORIES.includes(category as Category)) {
      return NextResponse.json({ error: 'Categoría de archivo no válida.' }, { status: 400 });
    }
    const cat = category as Category;

    if (!ALLOWED_TYPES[cat].includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido. Formatos válidos: ${ALLOWED_TYPES[cat].join(', ')}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'El archivo supera el límite de 5MB.' }, { status: 400 });
    }

    await ensureUploadBucket();
    const supabase = getSupabaseClient();

    const path = `${cat}/${Date.now()}-${sanitizeFilename(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage.from(SIGEM_BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(SIGEM_BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
  } catch (e: any) {
    console.error('Error subiendo archivo:', e);
    return NextResponse.json({ error: e.message || 'Error al subir el archivo.' }, { status: 500 });
  }
}
