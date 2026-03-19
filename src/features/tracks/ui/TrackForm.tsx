import React, { useState } from "react";
import {
  AppButton,
  AppInput,
  ImageCropper,
  UploadDropzone,
} from "@/shared/ui";
import type {
  Track,
  TrackVisibility,
  ProcessingStatus,
  UploadTrackInput,
} from "../model/track";

interface TrackFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<Track>;
  onSubmit: (
    payload: UploadTrackInput | Partial<UploadTrackInput>,
  ) => Promise<void>;
  isSubmitting?: boolean;
  progress?: number;
}

const genreOptions = [
  "Electronic",
  "House",
  "Hip-Hop",
  "Ambient",
  "Pop",
  "Other",
];

const normalizeTags = (value: string): string[] =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const TrackForm: React.FC<TrackFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  progress,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [step, setStep] = useState<1 | 2>(mode === "create" ? 1 : 2);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [genre, setGenre] = useState(initialValues?.genre ?? "Electronic");
  const [tags, setTags] = useState((initialValues?.tags ?? []).join(", "));
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [artworkUrl, setArtworkUrl] = useState(initialValues?.artworkUrl ?? "");
  const [showCropper, setShowCropper] = useState(false);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [releaseDate, setReleaseDate] = useState(
    initialValues?.releaseDate ?? "",
  );
  const [visibility, setVisibility] = useState<TrackVisibility>(
    initialValues?.visibility ?? "Public",
  );
  const [status, setStatus] = useState<ProcessingStatus>(
    initialValues?.status ?? "Finished",
  );

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validType =
      selectedFile.type === "audio/mpeg" ||
      selectedFile.type === "audio/wav" ||
      selectedFile.name.endsWith(".mp3") ||
      selectedFile.name.endsWith(".wav");

    if (!validType) {
      setFile(null);
      setFileError("Please select an MP3 or WAV file.");
      return;
    }

    setFileError("");
    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === "create" && !file) {
      setFileError("Audio file is required.");
      return;
    }

    const payload: UploadTrackInput = {
      title,
      genre,
      tags: normalizeTags(tags),
      description,
      artworkUrl,
      releaseDate,
      visibility,
      status,
      fileName: file?.name ?? initialValues?.audioFileName ?? "",
    };

    if (mode === "edit") {
      await onSubmit({
        title: payload.title,
        genre: payload.genre,
        tags: payload.tags,
        description: payload.description,
        artworkUrl: payload.artworkUrl,
        releaseDate: payload.releaseDate,
        visibility: payload.visibility,
        status: payload.status,
      });
      return;
    }

    await onSubmit(payload);
  };

  const inputClasses =
    "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none focus:border-orange-500 focus:bg-[#202020] transition-colors placeholder:text-neutral-600";
  const labelClasses =
    "block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "create" && step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <UploadDropzone
            file={file}
            error={fileError}
            onFileSelect={handleFileSelect}
          />
          <div className="pt-6 flex justify-end">
            <AppButton
              type="button"
              disabled={!file}
              onClick={() => setStep(2)}
              className="rounded-full bg-orange-500 px-8 py-3.5 text-sm font-bold tracking-wide text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-30 transition-all shadow-lg"
            >
              NEXT: EDIT METADATA
            </AppButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
          {mode === "create" && file && (
            <div className="bg-[#151515] p-4 rounded-xl border border-white/5 flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                    AUDIO
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold w-full truncate">
                    {file.name}
                  </p>
                  <AppButton
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-orange-500 hover:underline"
                  >
                    Change File
                  </AppButton>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className={labelClasses}>
              Title <span className="text-red-500">*</span>
            </label>
            <AppInput
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className={inputClasses}
              placeholder="Give your track a name"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Genre</label>
              <div className="relative">
                <select
                  value={genre}
                  onChange={(event) => setGenre(event.target.value)}
                  className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                >
                  {genreOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                  <svg
                    className="h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Release Date</label>
              <AppInput
                type="date"
                value={releaseDate}
                onChange={(event) => setReleaseDate(event.target.value)}
                className={`${inputClasses} [color-scheme:dark]`}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Cover Art</label>
            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-24 h-24 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                {artworkUrl ? (
                  <img
                    src={artworkUrl}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-neutral-600">
                    NO ART
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all text-center">
                  Upload Image
                  <AppInput
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setArtworkFile(e.target.files[0]);
                        setShowCropper(true);
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-neutral-500">
                  Must be a square image (aspect ratio 1:1).
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Tags</label>
            <AppInput
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className={inputClasses}
              placeholder="house, club, vocal (comma separated)"
            />
          </div>

          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className={`${inputClasses} resize-y min-h-[100px] leading-relaxed`}
              placeholder="Tell the story behind this track..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className={labelClasses}>Visibility</p>
              <div className="flex rounded-lg border border-white/10 p-1 w-fit bg-[#1a1a1a]">
                {(["Public", "Private"] as const).map((option) => (
                  <AppButton
                    key={option}
                    type="button"
                    onClick={() => setVisibility(option)}
                    className={`rounded-md px-6 py-2 text-sm font-bold transition-all ${
                      visibility === option
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    {option}
                  </AppButton>
                ))}
              </div>
            </div>

            <div>
              <p className={labelClasses}>Processing Status</p>
              <div className="flex rounded-lg border border-white/10 p-1 w-fit bg-[#1a1a1a]">
                {(["Processing", "Finished"] as const).map((option) => (
                  <AppButton
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={`rounded-md px-4 py-2 text-sm font-bold transition-all ${
                      status === option
                        ? "bg-slate-700 text-white shadow-md"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    {option}
                  </AppButton>
                ))}
              </div>
            </div>
          </div>

          {typeof progress === "number" ? (
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10">
              <div className="mb-2 flex justify-between text-xs font-bold tracking-wide text-white uppercase">
                <span>Uploading...</span>
                <span className="text-orange-500">{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-black overflow-hidden relative shadow-inner">
                <div
                  className="absolute left-0 top-0 h-full bg-orange-500 transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="pt-4 border-t border-white/5 flex gap-4">
            <AppButton
              type="submit"
              disabled={isSubmitting}
              className="flex-1 lg:flex-none rounded-full bg-orange-500 px-8 py-3.5 text-sm font-bold tracking-wide text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-500 transition-all shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5"
            >
              {isSubmitting
                ? "PROCESSING..."
                : mode === "create"
                  ? "UPLOAD TRACK"
                  : "SAVE METADATA"}
            </AppButton>
          </div>
        </div>
      )}

      {showCropper && artworkFile ? (
        <ImageCropper
          imageFile={artworkFile}
          onClose={() => {
            setShowCropper(false);
            setArtworkFile(null);
          }}
          onCropComplete={(_blob, url) => {
            setArtworkUrl(url);
            setShowCropper(false);
          }}
        />
      ) : null}
    </form>
  );
};

export default TrackForm;
