import { pb } from "@/lib/pocketbase";
import React, { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";

type ImageItem = {
  file: File;
  preview: string;
};

export default function UploadCard() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    setProcessing(true);

    try {
      const processed = await Promise.all(
        files.map(async (file) => {
          if (!file.type.startsWith("image/")) return null;

          let finalFile = file;
          if (file.size / 1024 / 1024 > 3) {
            finalFile = await imageCompression(file, {
              maxSizeMB: 3,
              maxWidthOrHeight: 1920,
            });
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
      setProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    setImages((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (images.length === 0) return;

    try {
      setLoading(true);

      for (const img of images) {
        const formData = new FormData();
        formData.append("image", img.file);
        formData.append("comment", comment);

        await pb.collection("photos").create(formData);
      }

      console.log("Uploaded:", images.length, "images");

      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      setComment("");
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-lg p-4 transition hover:shadow-xl">
      {processing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-600 font-medium">
              Processing...
            </span>
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-xl cursor-pointer transition
          ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        `}
      >
        <p className="text-sm text-gray-500">Drag & drop images here</p>
        <p className="text-xs text-gray-400 mt-1">or click to browse</p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {images.map((img, index) => (
            <div key={img.preview} className="relative">
              <img
                src={img.preview}
                alt="preview"
                className="w-16 h-16 object-cover rounded border"
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
      )}

      <textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full mt-3 p-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-400 outline-none"
        rows={2}
      />

      <div className="flex justify-between items-center mt-3">
        <button
          onClick={() => {
            images.forEach((img) => URL.revokeObjectURL(img.preview));
            setImages([]);
          }}
          className="text-xs text-gray-400 hover:text-red-500"
        >
          Remove all
        </button>

        <button
          onClick={handleUpload}
          disabled={loading || images.length === 0}
          className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? `Uploading ${images.length}...`
            : `Upload ${images.length > 1 ? `${images.length} images` : "Image"}`}
        </button>
      </div>
    </div>
  );
}
