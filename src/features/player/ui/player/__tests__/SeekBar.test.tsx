import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SeekBar } from "../SeekBar";

describe("SeekBar Component", () => {
  it("renders correctly", () => {
    render(<SeekBar currentTime={30} duration={120} buffered={0.5} onSeek={vi.fn()} />);
    expect(screen.getByTestId("sc-seekbar")).toBeInTheDocument();
  });

  it("calls onSeek with appropriate time on click", () => {
    const handleSeek = vi.fn();
    render(<SeekBar currentTime={30} duration={120} buffered={0.5} onSeek={handleSeek} />);
    
    const seekbar = screen.getByTestId("sc-seekbar");
    
    // Mock getBoundingClientRect for the track
    vi.spyOn(seekbar.firstChild as Element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      height: 10,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    // Fire click at exactly 50% width
    fireEvent.click(seekbar.firstChild as Element, { clientX: 50 });
    
    // Should seek to 50% of 120s = 60s
    expect(handleSeek).toHaveBeenCalledWith(60);
  });

  it("handles keyboard navigation correctly", () => {
    const handleSeek = vi.fn();
    render(<SeekBar currentTime={30} duration={120} buffered={0.5} onSeek={handleSeek} />);
    
    const slider = screen.getByRole("slider");
    
    // Right arrow
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(handleSeek).toHaveBeenCalledWith(35); // 30 + 5
    
    // Left arrow
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(handleSeek).toHaveBeenCalledWith(25); // 30 - 5
  });
});
