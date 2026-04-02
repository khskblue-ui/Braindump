import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import sharp from 'sharp';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

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

  // Always use .jpg since Sharp outputs JPEG
  const ext = 'jpg';

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
      contentType: 'image/jpeg',
      upsert: false,
    }),
    supabase.storage.from('entry-images').upload(thumbPath, thumbBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    }),
  ]);

  // Rollback on partial failure
  if (mainResult.error || thumbResult.error) {
    // If one succeeded, clean it up
    if (!mainResult.error) {
      await supabase.storage.from('entry-images').remove([mainPath]);
    }
    if (!thumbResult.error) {
      await supabase.storage.from('entry-images').remove([thumbPath]);
    }
    console.error('Upload error:', mainResult.error || thumbResult.error);
    return NextResponse.json(
      { error: '이미지 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }

  // Generate signed URLs instead of public URLs
  const [mainSigned, thumbSigned] = await Promise.all([
    supabase.storage.from('entry-images').createSignedUrl(mainPath, 3600),
    supabase.storage.from('entry-images').createSignedUrl(thumbPath, 3600),
  ]);

  // Store the base public URL for DB (signed URLs are generated on read)
  const { data: { publicUrl: imageUrl } } = supabase.storage
    .from('entry-images')
    .getPublicUrl(mainPath);

  const { data: { publicUrl: thumbnailUrl } } = supabase.storage
    .from('entry-images')
    .getPublicUrl(thumbPath);

  return NextResponse.json({
    image_url: mainSigned.data?.signedUrl || imageUrl,
    image_thumbnail_url: thumbSigned.data?.signedUrl || thumbnailUrl,
  });
}
