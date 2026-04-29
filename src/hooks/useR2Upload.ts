import { api } from '@/lib/axios';

export async function uploadToR2(file: File, folder: string): Promise<string> {
  // 1. 서버에서 presigned URL 발급
  const { data } = await api.post('/admin/upload/presigned', {
    folder,
    contentType: file.type,
  });
  const { uploadUrl, fileUrl } = data as { uploadUrl: string; fileUrl: string };

  // 2. R2에 직접 PUT 업로드
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  return fileUrl;
}
