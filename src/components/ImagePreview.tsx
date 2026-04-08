import { useState } from "react";

type Props = {
  images: string[];
  recordId: string;
  baseUrl: string;
  collectionID: string;
};

export default function ImagePreviewRow({
  images,
  recordId,
  baseUrl,
  collectionID,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const getImageUrl = (filename: string) => {
    return `${baseUrl}/api/files/${collectionID}/${recordId}/${filename}`;
  };

  return (
    <>
      <div className="flex gap-2 overflow-x-auto p-2 border rounded min-h-[88px] items-center ">
        {images.length === 0 ? (
          <div className="flex flex-col items-center text-gray-400 text-sm">
            {/* ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 mb-1 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V6a2 2 0 012-2h14a2 2 0 012 2v10.5M3 16.5l4.5-4.5a2 2 0 012.828 0L15 16.5M3 16.5h18M15 10.5h.01"
              />
            </svg>

            <span>No image</span>
          </div>
        ) : (
          images.map((file, i) => {
            const url = getImageUrl(file);

            return (
              <img
                key={i}
                src={url}
                onClick={() => setSelected(url)}
                className="h-20 w-20 object-cover rounded cursor-pointer hover:opacity-80 shrink-0"
              />
            );
          })
        )}
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
