"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TrackCard from "@/features/tracks/ui/TrackCard";
import TrackForm from "@/features/tracks/ui/TrackForm";
import { AppButton, NavBar } from "@/shared/ui";
import {
  useDeleteTrack,
  useTracks,
  useUpdateTrack,
} from "@/features/tracks/model/trackQueries";
import type {
  Track,
  UpdateTrackInput,
  UploadTrackInput,
} from "@/features/tracks/model/track";
import { ROUTES } from "@/shared/constants/routes";

const MyTracksPage: React.FC = () => {
  const router = useRouter();
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const tracksQuery = useTracks();
  const deleteTrackMutation = useDeleteTrack();
  const updateTrackMutation = useUpdateTrack();

  const handleDelete = async (id: string) => {
    await deleteTrackMutation.mutateAsync(id);
  };

  const handleEditSubmit = async (
    payload: UploadTrackInput | Partial<UploadTrackInput>,
  ) => {
    if (!editingTrack) return;

    await updateTrackMutation.mutateAsync({
      id: editingTrack.id,
      updates: payload as UpdateTrackInput,
    });
    setEditingTrack(null);
  };

  const tracks = tracksQuery.data ?? [];
  const loading = tracksQuery.isLoading;

  const sortedTracks = useMemo(
    () => [...tracks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tracks],
  );

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />
      <div className="max-w-6xl mx-auto p-6 md:p-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Track Management
          </h1>
          <p className="mt-2 text-sm text-neutral-400 font-medium">
            Manage your uploaded tracks, edit metadata, or modify visibility.
          </p>
        </div>
      </div>

      {editingTrack ? (
        <div className="mb-10 rounded-2xl border border-white/10 bg-sc-surface-1 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0 opacity-50"></div>
          <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Edit Track:{" "}
              <span className="text-orange-500">{editingTrack.title}</span>
            </h2>
            <AppButton
              type="button"
              onClick={() => setEditingTrack(null)}
              className="text-xs font-bold tracking-widest text-neutral-500 hover:text-white uppercase transition-colors"
            >
              Cancel
            </AppButton>
          </div>
          <TrackForm
            mode="edit"
            initialValues={editingTrack}
            onSubmit={handleEditSubmit}
            isSubmitting={updateTrackMutation.isPending}
          />
        </div>
      ) : null}

      <section className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-sm font-bold tracking-widest text-orange-500 animate-pulse uppercase">
            Loading tracks...
          </div>
        ) : null}

        {!loading && sortedTracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-sc-surface-2 p-16 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No tracks yet</h3>
            <p className="text-neutral-500 text-sm">
              Upload your first track to get started.
            </p>
          </div>
        ) : null}

        {sortedTracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            onEdit={setEditingTrack}
            onDelete={handleDelete}
          />
        ))}
      </section>
      </div>
    </div>
  );
};

export default MyTracksPage;
