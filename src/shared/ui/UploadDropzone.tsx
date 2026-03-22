"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { AppButton } from "@/shared/ui";

interface UploadDropzoneProps {
  file: File | null;
  error: string;
  onFileSelect: (file: File | null) => void;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  file,
  error,
  onFileSelect,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div data-testid="upload-dropzone" className="space-y-3">
      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
        Audio File
      </label>

      {!file ? (
        <div
          data-testid="upload-dropzone-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer ${
            isDragOver
              ? "border-orange-500 bg-orange-500/10 scale-[1.02]"
              : "border-white/10 bg-[#1a1a1a] hover:bg-[#202020] hover:border-white/20"
          }`}
          onClick={handleBrowseClick}
        >
          <div
            className={`mb-4 rounded-full p-4 ${isDragOver ? "bg-orange-500 text-white" : "bg-white/5 text-neutral-400"} transition-colors duration-300`}
          >
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="mb-2 text-base font-bold text-white">
            Drag and drop your audio file
          </p>
          <p className="text-sm text-neutral-500 font-medium">
            or{" "}
            <span className="text-orange-500 hover:text-orange-400 cursor-pointer underline">
              browse your files
            </span>
          </p>
          <p className="mt-4 text-xs font-semibold text-neutral-600 uppercase tracking-widest">
            Supports MP3, WAV
          </p>

          <input
            ref={fileInputRef}
            data-testid="upload-dropzone-input"
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              onFileSelect(selected);
            }}
          />
        </div>
      ) : (
        <div className="rounded-xl bg-orange-500/10 p-5 border border-orange-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-orange-400/80 font-medium mt-0.5">
                Ready for upload
              </p>
            </div>
          </div>
          <AppButton
            data-testid="upload-dropzone-remove"
            type="button"
            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
            onClick={() => onFileSelect(null)}
            title="Remove file"
          >
            <X size={20} />
          </AppButton>
        </div>
      )}

      {error ? (
        <p data-testid="upload-dropzone-error" className="text-xs font-bold text-red-500 flex items-center gap-1.5 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
          <AlertCircleIcon size={14} /> {error}
        </p>
      ) : null}
    </div>
  );
};

const AlertCircleIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default UploadDropzone;
