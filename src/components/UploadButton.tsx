import { useRef } from "react";
type ImageItem = {
  file: File;
  preview: string;
};
type Props = {
  images: any[];
  setImages: any;
  handleFiles: (files: FileList | File[]) => void;
  loading?: boolean;
};

export default function ImageUploader({
  images,
  setImages,
  handleFiles,
  loading = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      {/* hidden input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer hover:border-blue-400"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Processing...
          </>
        ) : (
          "+ Add Photos"
        )}
      </div>
    </div>
  );
}
