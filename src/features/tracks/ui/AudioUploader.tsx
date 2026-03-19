import React from "react";

interface AudioUploaderProps {
  file: File | null;
  error: string;
  onFileSelect: (file: File | null) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({
  file,
  error,
  onFileSelect,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Audio File
      </label>
      <input
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        onChange={(event) => {
          const selected = event.target.files?.[0] ?? null;
          onFileSelect(selected);
        }}
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-white hover:file:bg-orange-600"
      />
      <p className="text-xs text-slate-500">Allowed formats: MP3, WAV</p>
      {file ? (
        <div className="rounded-md bg-slate-50 p-2 text-xs text-slate-700">
          Selected: {file.name}
        </div>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};

export default AudioUploader;
