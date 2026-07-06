import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'];
const BUCKET = 'product-images';

export async function POST(request: Request) {
  // Autorización: solo admin/staff.
  const supabase = await createServerSupabase();
  const { data: role } = await supabase.rpc('current_role_name');
  if (role !== 'admin' && role !== 'staff') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Archivo no válido' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Formato no permitido (usa JPG, PNG, WebP…).' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'La imagen supera 5 MB.' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const admin = createAdminSupabase();
  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: 'No fue posible subir la imagen.' }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
