import React, { useEffect, useState } from "react";

type ImageItem = {
  file: File;
  preview: string;
};

type Props = {
  onChange?: (files: File[], taskId: string) => void;
  taskId?: string;
  uploadedTrigger: number; // 👈 add this
};

const MAX_SIZE_MB = 1;
const MAX_WIDTH = 1024;
const QUALITY = 0.7;

export default function MultiImageUpload({
  onChange,
  taskId,
  uploadedTrigger,
}: Props) {
  const [images, setImages] = useState<ImageItem[]>([]);
  useEffect(() => {
    setImages([]); // clear preview after upload
  }, [uploadedTrigger]);
  // ✅ notify parent
  useEffect(() => {
    if (!onChange) return;

    onChange(
      images.map((i) => i.file),
      taskId || "",
    );
  }, [images]);

  // ✅ cleanup memory (IMPORTANT)
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const processed: ImageItem[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      let finalFile = file;

      if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
        finalFile = await compressImage(file);
      }

      processed.push({
        file: finalFile,
        preview: URL.createObjectURL(finalFile),
      });
    }

    setImages((prev) => [...prev, ...processed]);

    e.target.value = "";
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") img.src = result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return;

            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
              }),
            );
          },
          "image/jpeg",
          QUALITY,
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = [...prev];

      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);

      return updated;
    });
  };

  return (
    <div className="w-full">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        className="mb-3"
      />

      {images.length === 0 && (
        <p className="text-xs text-gray-500">No new images</p>
      )}

      {/* 🔥 horizontal preview */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <div key={index} className="relative flex-shrink-0">
            <img
              src={img.preview}
              className="w-20 h-20 object-cover rounded border"
            />

            <button
              onClick={() => removeImage(index)}
              className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
