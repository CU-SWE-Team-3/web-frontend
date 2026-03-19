"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TrackForm from "@/features/tracks/ui/TrackForm";
import type { UploadTrackInput } from "@/features/tracks/model/track";
import { useUploadTrack } from "@/features/tracks/model/trackQueries";

const UploadTrackPage: React.FC = () => {
  const router = useRouter();
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");
  const uploadTrackMutation = useUploadTrack();

  const handleSubmit = async (
    payload: UploadTrackInput | Partial<UploadTrackInput>,
  ) => {
    setError("");
    setProgress(0);

    try {
      const track = await uploadTrackMutation.mutateAsync({
        payload: payload as UploadTrackInput,
        onProgress: (value: number) => setProgress(value),
      });
      router.push(`/tracks/${track.id}`);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setTimeout(() => setProgress(undefined), 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Upload Track
        </h1>
        <p className="mt-2 text-sm text-neutral-400 font-medium tracking-wide">
          Share your latest creation with the world. Support for MP3 and WAV.
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-sc-surface-1 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <TrackForm
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={uploadTrackMutation.isPending}
            progress={progress}
          />

          {error ? (
            <p className="mt-6 text-sm font-bold text-red-500 text-center bg-red-500/10 p-3 rounded">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UploadTrackPage;
