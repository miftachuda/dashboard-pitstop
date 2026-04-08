import { useState } from "react";

type Props = {
  images: string[];

  recordId: string;
  baseUrl: string; // e.g. http://127.0.0.1:8090
};

export default function ImagePreviewRow({ images, recordId, baseUrl }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const getImageUrl = (filename: string) => {
    return `${baseUrl}/api/files/highlight_pitstop/${recordId}/${filename}`;
  };

  return (
    <>
      {/* THUMBNAILS */}
      <div className="flex gap-2 overflow-x-auto p-2 border rounded">
        {images.map((file, i) => {
          const url = getImageUrl(file);

          return (
            <img
              key={i}
              src={url}
              onClick={() => setSelected(url)}
              className="h-20 w-20 object-cover rounded cursor-pointer hover:opacity-80 shrink-0"
            />
          );
        })}
      </div>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <img
            src={selected}
            className="max-h-[90%] max-w-[90%] rounded shadow-lg"
          />
        </div>
      )}
    </>
  );
}
