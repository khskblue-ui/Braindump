import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '5MB 이하만 가능합니다.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'JPEG, PNG, WebP만 지원합니다.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';

  // Resize main image (max 1920px width)
  const mainBuffer = await sharp(buffer)
    .resize(1920, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Generate thumbnail (400px)
  const thumbBuffer = await sharp(buffer)
    .resize(400, null, { withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();

  const mainPath = `${user.id}/${timestamp}_main.${ext}`;
  const thumbPath = `${user.id}/${timestamp}_thumb.${ext}`;

  // Upload both in parallel
  const [mainResult, thumbResult] = await Promise.all([
    supabase.storage.from('entry-images').upload(mainPath, mainBuffer, {
      contentType: file.type,
      upsert: false,
    }),
    supabase.storage.from('entry-images').upload(thumbPath, thumbBuffer, {
      contentType: file.type,
      upsert: false,
    }),
  ]);

  if (mainResult.error || thumbResult.error) {
    return NextResponse.json(
      { error: '이미지 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }

  const { data: { publicUrl: imageUrl } } = supabase.storage
    .from('entry-images')
    .getPublicUrl(mainPath);

  const { data: { publicUrl: thumbnailUrl } } = supabase.storage
    .from('entry-images')
    .getPublicUrl(thumbPath);

  return NextResponse.json({
    image_url: imageUrl,
    image_thumbnail_url: thumbnailUrl,
  });
}
