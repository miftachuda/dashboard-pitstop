import React, { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/image-gallery.css";

import { pb } from "@/lib/pocketbase";

type Photo = {
  id: string;
  image: string;
  comment: string;
};

type GalleryItem = {
  original: string;
  thumbnail: string;
  description?: string;
};

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // 📥 Load photos
  const loadPhotos = async () => {
    const records = await pb.collection("photos").getFullList({
      sort: "-created",
    });

    const mapped: Photo[] = records.map((r: any) => ({
      id: r.id,
      image: pb.files.getURL(r, r.image),
      comment: r.comment,
    }));

    setPhotos(mapped);

    // 🔄 Convert to gallery format
    const gallery = mapped.map((p) => ({
      original: p.image,
      thumbnail: p.image,
      description: p.comment,
    }));

    setGalleryItems(gallery);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // 📷 Handle file select + compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    try {
      const compressed = await imageCompression(selected, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch (err) {
      console.error(err);
    }
  };

  // ⬆️ Upload
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("comment", comment);

      await pb.collection("photos").create(formData);

      setFile(null);
      setPreview(null);
      setComment("");

      await loadPhotos();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📸 Photo Gallery</h1>
      <div className="bg-white p-3 rounded-lg border mb-4 max-w-sm">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm"
        />

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-2 w-28 h-28 object-cover rounded"
          />
        )}

        <textarea
          placeholder="Comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full mt-2 p-1.5 text-sm border rounded resize-none"
          rows={2}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "..." : "Upload"}
        </button>
      </div>

      {/* Gallery Section */}
      {galleryItems.length > 0 ? (
        <ImageGallery
          items={galleryItems}
          showPlayButton={false}
          showFullscreenButton={true}
          showThumbnails={true}
        />
      ) : (
        <p>No photos yet.</p>
      )}
    </div>
  );
};

export default PhotoGallery;
