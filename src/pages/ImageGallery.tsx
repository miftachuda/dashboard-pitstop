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
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

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

  return (
    <DashboardLayout>
      <div className="p-6 w-full flex flex-col items-center justify-center">
        <div className="p-6 max-w-3xl items-center justify-center ">
          {/* Gallery Section */}
          {galleryItems.length > 0 ? (
            <ImageGallery
              items={galleryItems}
              showPlayButton={false}
              showFullscreenButton={true}
              showThumbnails={true}
              additionalClass="scrollable-gallery"
              renderItem={(item) => (
                <div className="w-full h-[400px] flex items-center justify-center bg-transparent">
                  <img
                    src={item.original}
                    alt={item.originalAlt || ""}
                    className="h-full object-contain"
                  />
                  <div className="absolute bottom-0 bg-black/50 text-white text-xs px-3 py-2 my-2 ">
                    {item.description}
                  </div>
                </div>
              )}
              renderThumbInner={(item) => (
                <div className="h-[70px] w-[90px] flex-shrink-0 overflow-hidden rounded">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            />
          ) : (
            <p>No photos yet.</p>
          )}
        </div>

        <UploadCard onUploadSuccess={loadPhotos}></UploadCard>
      </div>
    </DashboardLayout>
  );
};

export default PhotoGallery;
