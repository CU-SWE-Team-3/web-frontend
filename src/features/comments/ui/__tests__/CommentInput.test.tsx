import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CommentInput } from "../CommentInput";

const mockMutate = vi.fn();
vi.mock("../../model/usePostComment", () => ({
  usePostComment: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock("@/features/auth/model/useAuthStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    user: { id: "user-1", display_name: "Test User" },
  }),
}));

describe("CommentInput Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with test IDs", () => {
    render(<CommentInput trackId="test-track-1" currentTime={65} />);
    expect(screen.getByTestId("comment-input")).toBeInTheDocument();
    expect(screen.getByTestId("comment-text-input")).toBeInTheDocument();
    expect(screen.getByTestId("comment-submit-button")).toBeInTheDocument();
  });

  it("updates input text and shows timestamp", () => {
    render(<CommentInput trackId="test-track-1" currentTime={65} />); // 1:05
    
    const input = screen.getByTestId("comment-text-input");
    fireEvent.change(input, { target: { value: "Great track!" } });
    
    expect(input).toHaveValue("Great track!");
    
    // Timestamp badge should appear once text is entered
    const badge = screen.getByTestId("comment-timestamp-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("at 1:05");
  });

  it("submits comment using the button", () => {
    render(<CommentInput trackId="test-track-1" currentTime={65} />);
    
    const input = screen.getByTestId("comment-text-input");
    fireEvent.change(input, { target: { value: "Awesome!" } });
    
    const submitBtn = screen.getByTestId("comment-submit-button");
    // Button is not disabled anymore
    expect(submitBtn).not.toBeDisabled();
    
    fireEvent.click(submitBtn);
    
    expect(mockMutate).toHaveBeenCalledWith(
      { text: "Awesome!", timestampSeconds: 65 },
      expect.any(Object)
    );
  });

  it("submits comment using the Enter key", () => {
    render(<CommentInput trackId="test-track-1" currentTime={65} />);
    
    const input = screen.getByTestId("comment-text-input");
    fireEvent.change(input, { target: { value: "Awesome!" } });
    
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: false });
    
    expect(mockMutate).toHaveBeenCalledWith(
      { text: "Awesome!", timestampSeconds: 65 },
      expect.any(Object)
    );
  });
});
