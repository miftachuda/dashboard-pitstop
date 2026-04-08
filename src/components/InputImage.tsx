import React, { useState } from "react";

type ImageItem = {
  file: File;
  preview: string;
};

type Props = {
  onChange?: (files: File[], taskId: string) => void;
  taskId?: string;
};

const MAX_SIZE_MB = 1;
const MAX_WIDTH = 1024;
const QUALITY = 0.7;

export default function MultiImageUpload({ onChange, taskId }: Props) {
  const [images, setImages] = useState<ImageItem[]>([]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const processed: (ImageItem | null)[] = await Promise.all(
      files.map(async (file: File) => {
        if (!file.type.startsWith("image/")) return null;

        let finalFile: File = file;

        if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
          finalFile = await compressImage(file);
        }

        return {
          file: finalFile,
          preview: URL.createObjectURL(finalFile),
        };
      }),
    );

    const validImages = processed.filter(
      (img): img is ImageItem => img !== null,
    );

    setImages((prev) => {
      const updated = [...prev, ...validImages];

      // 🔥 SEND TO PARENT
      onChange?.(
        updated.map((i) => i.file),
        taskId,
      );

      return updated;
    });

    e.target.value = "";
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          img.src = result;
        }
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
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

      // 🔥 UPDATE PARENT AFTER REMOVE
      onChange?.(
        updated.map((i) => i.file),
        taskId,
      );

      return updated;
    });
  };

  return (
    <div className="p-4 border rounded w-full max-w-lg">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        className="mb-4"
      />

      {images.length === 0 && (
        <p className="text-sm text-gray-500">No images selected</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div key={index} className="relative">
            <img
              src={img.preview}
              alt="preview"
              className="w-full h-32 object-cover rounded border"
            />

            <button
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
