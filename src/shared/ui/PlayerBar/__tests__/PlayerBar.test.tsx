import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PlayerBar } from "../PlayerBar";

describe("PlayerBar Component", () => {
  const mockTrack = {
    id: "track-1",
    title: "Test Song",
    artist: "Test Artist",
    artworkUrl: "http://example.com/art.jpg",
  };

  it("renders nothing if track is null", () => {
    const { container } = render(<PlayerBar track={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders track information and basic controls", () => {
    render(<PlayerBar track={mockTrack} isPlaying={false} currentTime={30} duration={120} />);
    
    expect(screen.getByTestId("sc-player-bar")).toBeInTheDocument();
    expect(screen.getAllByText("Test Song")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Test Artist")[0]).toBeInTheDocument();
    
    // Play button should be shown
    expect(screen.getByTestId("sc-btn-play-pause")).toBeInTheDocument();
  });

  it("fires onPlayPause when play button is clicked", () => {
    const handlePlayPause = vi.fn();
    render(<PlayerBar track={mockTrack} onPlayPause={handlePlayPause} />);
    
    fireEvent.click(screen.getByTestId("sc-btn-play-pause"));
    expect(handlePlayPause).toHaveBeenCalledOnce();
  });

  it("fires onNext and onPrev correctly", () => {
    const handleNext = vi.fn();
    const handlePrev = vi.fn();
    render(<PlayerBar track={mockTrack} onNext={handleNext} onPrev={handlePrev} />);
    
    fireEvent.click(screen.getByTestId("sc-btn-next"));
    expect(handleNext).toHaveBeenCalledOnce();
    
    fireEvent.click(screen.getByTestId("sc-btn-prev"));
    expect(handlePrev).toHaveBeenCalledOnce();
  });

  it("calls onToggleShuffle when shuffle is clicked", () => {
    const toggleShuffle = vi.fn();
    render(<PlayerBar track={mockTrack} onToggleShuffle={toggleShuffle} />);
    
    fireEvent.click(screen.getByTestId("sc-btn-shuffle"));
    expect(toggleShuffle).toHaveBeenCalledOnce();
  });

  it("calls onCycleRepeat when repeat is clicked", () => {
    const cycleRepeat = vi.fn();
    render(<PlayerBar track={mockTrack} onCycleRepeat={cycleRepeat} />);
    
    fireEvent.click(screen.getByTestId("sc-btn-repeat"));
    expect(cycleRepeat).toHaveBeenCalledOnce();
  });
});
