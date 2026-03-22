"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop as CropIcon, X } from "lucide-react";
import { AppButton } from "@/shared/ui";

interface ImageCropperProps {
  imageFile: File;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, croppedUrl: string) => void;
  aspectRatio?: number;
  title?: string;
  subtitle?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageFile,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  title = "Image Cropper",
  subtitle,
}) => {
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      setImgSrc(reader.result?.toString() || ""),
    );
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio;
    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const previewUrl = URL.createObjectURL(blob);
        onCropComplete(blob, previewUrl);
      },
      "image/jpeg",
      0.95,
    );
  };

  return (
    <div data-testid="image-cropper-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111111] rounded shadow-2xl max-w-[800px] w-full flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h3 className="text-white text-[24px] font-bold tracking-tight mb-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-white font-medium text-[15px]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="p-6 overflow-hidden flex-1 flex flex-col items-center justify-center bg-[#111111]">
          {imgSrc && (
            <div className="relative flex justify-center items-center w-full h-[400px]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                circularCrop={aspectRatio === 1}
                className="max-h-full max-w-full"
              >
                <img
                  data-testid="image-cropper-image"
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[400px] w-auto mx-auto object-contain"
                  style={{ transform: `scale(${zoom})` }}
                />
              </ReactCrop>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 shrink-0 flex items-center justify-between bg-[#111111]">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3 w-64">
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="w-8 h-8 flex items-center justify-center text-white bg-[#333] hover:bg-[#444] rounded"
            >
              -
            </button>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.01" 
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-white"
            />
            <button 
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="w-8 h-8 flex items-center justify-center text-white bg-[#333] hover:bg-[#444] rounded"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              data-testid="image-cropper-cancel"
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded text-[15px] font-bold text-white bg-[#333] hover:bg-[#444] transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="image-cropper-apply"
              type="button"
              onClick={handleApplyCrop}
              className="px-6 py-2 rounded text-[15px] font-bold text-black bg-white hover:bg-gray-200 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
