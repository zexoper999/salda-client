'use client';

import { useRef, useState } from 'react';
import { uploadToR2 } from '@/hooks/useR2Upload';

interface Props {
  folder: string;
  images: string[];
  maxCount?: number;
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({ folder, images, maxCount = 10, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    const remaining = maxCount - images.length;
    const selected = Array.from(files).slice(0, remaining);
    if (!selected.length) return;

    setUploading(true);
    try {
      const urls = await Promise.all(selected.map((f) => uploadToR2(f, folder)));
      onChange([...images, ...urls]);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <div className="flex flex-wrap gap-3">
        {/* 기존 이미지들 */}
        {images.map((url, idx) => (
          <div key={idx} className="relative w-36 h-24 rounded-lg overflow-hidden border border-gray-200 group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs
                opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}

        {/* 추가 버튼 */}
        {images.length < maxCount && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-36 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col
              items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500
              transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <span className="text-xs">업로드 중...</span>
            ) : (
              <>
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs">사진추가하기</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
