import React, { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/image-gallery.css";

import { pb } from "@/lib/pocketbase";
import DashboardLayout from "@/components/MainLayout";
import UploadCard from "@/components/PhotoUpload";

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
  const [processing, setProcessing] = useState(false);

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

    setProcessing(true);
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
    } finally {
      setProcessing(false);
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
    <DashboardLayout>
      <div className="p-6 max-w-3xl items-center justify-center mx-auto space-y-8">
        {processing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center gap-3 shadow-xl">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600 font-medium">Processing image...</span>
            </div>
          </div>
        )}
        <div className="p-6 max-w-3xl items-center justify-center mx-auto">
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

        <UploadCard></UploadCard>
      </div>
    </DashboardLayout>
  );
};

export default PhotoGallery;
