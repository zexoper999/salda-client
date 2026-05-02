import { api } from '@/lib/axios';

export async function uploadInquiryImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `inquiry_${Date.now()}.${ext}`;
  const res = await api.post('/upload/presigned', {
    folder: 'inquiries',
    fileName,
    contentType: file.type,
  });
  const { uploadUrl, fileUrl } = res.data.data;
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  return fileUrl;
}
