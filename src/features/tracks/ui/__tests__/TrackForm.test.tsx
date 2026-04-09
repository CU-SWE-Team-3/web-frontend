import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import TrackForm from "../TrackForm";

// Mock child components
vi.mock("@/shared/ui", () => ({
  AppButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AppInput: ({ ...props }: any) => <input {...props} />,
  ImageCropper: () => <div data-testid="image-cropper">Image Cropper Mock</div>,
  UploadDropzone: ({ onFileSelect }: any) => (
    <div data-testid="upload-dropzone">
      <button onClick={() => onFileSelect(new File([""], "test.mp3", { type: "audio/mpeg" }))}>
        Select Mock File
      </button>
    </div>
  ),
}));

vi.mock("@/shared/ui/RecordSection", () => ({
  default: () => <div data-testid="record-section">Record Section Mock</div>,
}));

describe("TrackForm Component", () => {
  it("renders upload dropzone in create mode initially", () => {
    const handleSub = vi.fn();
    render(<TrackForm mode="create" onSubmit={handleSub} />);
    expect(screen.getByTestId("upload-dropzone")).toBeInTheDocument();
  });

  it("transitions to metadata step after file selection in create mode", async () => {
    const handleSub = vi.fn();
    render(<TrackForm mode="create" onSubmit={handleSub} />);
    
    // Select mock file
    fireEvent.click(screen.getByText("Select Mock File"));
    
    // Click NEXT
    fireEvent.click(screen.getByText(/NEXT: EDIT METADATA/i));
    
    await waitFor(() => {
      expect(screen.getByTestId("track-form-title-input")).toBeInTheDocument();
    });
  });

  it("renders metadata fields immediately in edit mode", () => {
    const handleSub = vi.fn();
    render(<TrackForm mode="edit" onSubmit={handleSub} initialValues={{ title: "My Track" }} />);
    
    expect(screen.getByTestId("track-form-title-input")).toHaveValue("My Track");
    expect(screen.queryByTestId("upload-dropzone")).not.toBeInTheDocument();
  });

  it("submits metadata correctly in edit mode", async () => {
    const handleSub = vi.fn().mockResolvedValue(true);
    render(
      <TrackForm 
        mode="edit" 
        initialValues={{ title: "Old Title", genre: "Pop", tags: ["cool"] }} 
        onSubmit={handleSub} 
      />
    );

    const titleInput = screen.getByTestId("track-form-title-input");
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    const submitBtn = screen.getByTestId("track-form-submit-button");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSub).toHaveBeenCalledWith(expect.objectContaining({
        title: "New Title",
        genre: "Pop",
        tags: ["cool"],
      }));
    });
  });
});
