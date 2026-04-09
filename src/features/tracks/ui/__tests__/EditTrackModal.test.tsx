import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import EditTrackModal from "../EditTrackModal";

const mockTrack = {
  id: "test-track-1",
  title: "Test Track Title",
  genre: "House",
  tags: ["electronic", "dance"],
  description: "A test description",
  visibility: "Public" as const,
  status: "Finished" as const,
  audioFileName: "test.mp3",
  artworkUrl: "http://example.com/artwork.png",
  waveform: [],
  duration: "3:00",
  createdAt: new Date().toISOString()
};

describe("EditTrackModal Component", () => {
  it("renders correctly when open is true", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    render(<EditTrackModal track={mockTrack} open={true} onClose={handleClose} onSave={handleSave} />);

    expect(screen.getByTestId("edit-track-modal")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    render(<EditTrackModal track={mockTrack} open={false} onClose={handleClose} onSave={handleSave} />);

    expect(screen.queryByTestId("edit-track-modal")).not.toBeInTheDocument();
  });

  it("populates inputs with track data", () => {
    render(<EditTrackModal track={mockTrack} open={true} onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByTestId("edit-track-title-input")).toHaveValue("Test Track Title");
    expect(screen.getByTestId("edit-track-genre-input")).toHaveValue("House");
    expect(screen.getByTestId("edit-track-tags-input")).toHaveValue("electronic, dance");
    expect(screen.getByTestId("edit-track-description-input")).toHaveValue("A test description");
  });

  it("calls onSave with updated data when save button clicked", async () => {
    const handleSave = vi.fn().mockResolvedValue(true);
    render(<EditTrackModal track={mockTrack} open={true} onClose={vi.fn()} onSave={handleSave} />);

    const titleInput = screen.getByTestId("edit-track-title-input");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    const saveBtn = screen.getByTestId("edit-track-save-button");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({
        title: "Updated Title",
        genre: "House",
        description: "A test description"
      }));
    });
  });

  it("calls onClose when cancel button is clicked", () => {
    const handleClose = vi.fn();
    render(<EditTrackModal track={mockTrack} open={true} onClose={handleClose} onSave={vi.fn()} />);

    const cancelBtn = screen.getByTestId("edit-track-cancel-button");
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
