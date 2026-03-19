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
}

const ASPECT_RATIO = 1;

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
}) => {
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();

  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      setImgSrc(reader.result?.toString() || ""),
    );
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, ASPECT_RATIO));
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-2xl w-full border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
          <h3 className="text-white font-bold flex items-center gap-2">
            <CropIcon size={18} className="text-orange-500" /> Image Cropper
          </h3>
          <AppButton
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </AppButton>
        </div>

        <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-[#111]">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT_RATIO}
              circularCrop={false}
              className="max-h-[60vh]"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-h-[60vh] w-auto mx-auto border border-white/5 shadow-2xl"
              />
            </ReactCrop>
          )}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0 flex justify-end gap-3 bg-[#151515]">
          <AppButton
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            CANCEL
          </AppButton>
          <AppButton
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
          >
            CROP & APPLY
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
