export async function compressImage(
  file: File,
  maxSizeMB = 5,
  maxPx = 1200,
  quality = 0.85,
): Promise<File> {
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`이미지 크기는 최대 ${maxSizeMB}MB까지 허용됩니다.`);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height * maxPx) / width);
          width = maxPx;
        } else {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('이미지 변환 실패')); return; }
          resolve(new File([blob], file.name, { type: blob.type }));
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality,
      );
    };
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = url;
  });
}
