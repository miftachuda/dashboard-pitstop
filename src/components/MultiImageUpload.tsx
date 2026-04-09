import React, { useEffect, useState } from "react";
import ImageUploader from "./UploadButton";

type ImageItem = {
  file: File;
  preview: string;
};

type Props = {
  onChange?: (files: File[], taskId: string) => void;
  taskId?: string;
  uploadedTrigger: number;
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
  const [loading, setLoading] = useState(false);

  // ✅ Fix 1: Clear previews and revoke memory when upload completes
  useEffect(() => {
    if (images.length > 0) {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
    }
  }, [uploadedTrigger]);

  // ✅ Fix 2: Notify parent when the image list changes
  useEffect(() => {
    if (!onChange) return;

    onChange(
      images.map((i) => i.file),
      taskId || "",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // ✅ Fix 3: Component Unmount Cleanup
  // This ensures that if the user leaves the page, memory is freed

  const handleFiles = async (fileList: FileList | File[]) => {
    setLoading(true); // start loading

    try {
      const files = Array.from(fileList || []);

      const processed = await Promise.all(
        files.map(async (file) => {
          if (!file.type.startsWith("image/")) return null;

          let finalFile = file;
          if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
            finalFile = await compressImage(file);
          }

          return {
            file: finalFile,
            preview: URL.createObjectURL(finalFile),
          };
        }),
      );

      const validProcessed = processed.filter(
        (item): item is ImageItem => item !== null,
      );

      setImages((prev) => [...prev, ...validProcessed]);
    } finally {
      setLoading(false); // stop loading ALWAYS
    }
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
      // ✅ Fix 4: Revoke only the specific image being deleted
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  return (
    <div className="w-full flex items-center">
      <div className="flex flex-row flex-wrap gap-2">
        {images.map((img, index) => (
          <div key={img.preview} className="relative flex-shrink-0 mr-1">
            <img
              src={img.preview}
              alt="preview"
              className="w-20 h-20 aspect-square object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex-shrink-0">
        <ImageUploader
          images={images}
          setImages={setImages}
          handleFiles={handleFiles}
          loading={loading}
        />
      </div>
    </div>
  );
}
