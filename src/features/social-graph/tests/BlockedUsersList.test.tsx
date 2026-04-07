import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BlockedUsersList } from "../ui/BlockedUsersList";
import { useBlockedUsers } from "../model/useBlockedUsers";
import { useUnblockUser } from "../model/useUnblockUser";
// Mock the hooks
jest.mock("../model/useBlockedUsers");
jest.mock("../model/useUnblockUser");

// Mocking toast inline since the file was moved
const mockToast = jest.fn();
jest.mock("@/shared/ui/AppToast/useAppToast", () => ({
  useAppToast: () => ({ toast: mockToast }),
}), { virtual: true });

const mockBlockedUsers = [
  { id: "1", username: "user-1", displayName: "User One", avatarUrl: "avatar1.png" },
  { id: "2", username: "user-2", displayName: "User Two", avatarUrl: "avatar2.png" },
];

describe("BlockedUsersList", () => {
  let mockMutate: jest.Mock;
  let mockToast: jest.Mock;

  beforeEach(() => {
    mockMutate = jest.fn();
    mockToast = jest.fn();

    (useUnblockUser as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      variables: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("1. renders blocked users list", () => {
    (useBlockedUsers as jest.Mock).mockReturnValue({
      data: mockBlockedUsers,
      isLoading: false,
      isError: false,
    });

    render(<BlockedUsersList />);
    
    expect(screen.getByTestId("blocked-users-list")).toBeInTheDocument();
    const rows = screen.getAllByTestId("blocked-user-row");
    expect(rows).toHaveLength(2);
    expect(screen.getByText("user-1")).toBeInTheDocument();
    expect(screen.getByText("User One")).toBeInTheDocument();
    expect(screen.getByText("user-2")).toBeInTheDocument();
  });

  it("2. shows empty state", () => {
    (useBlockedUsers as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<BlockedUsersList />);
    
    expect(screen.getByTestId("blocked-empty-state")).toBeInTheDocument();
    expect(screen.getByText("You haven't blocked anyone")).toBeInTheDocument();
  });

  it("3. shows loading skeleton", () => {
    (useBlockedUsers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<BlockedUsersList />);
    
    expect(screen.getByTestId("blocked-loading")).toBeInTheDocument();
  });

  it("4. unblock button removes user", async () => {
    (useBlockedUsers as jest.Mock).mockReturnValue({
      data: mockBlockedUsers,
      isLoading: false,
      isError: false,
    });

    mockMutate.mockImplementation((userId, options) => {
      // simulate success
      options.onSuccess();
    });

    render(<BlockedUsersList />);
    
    const unblockButtons = screen.getAllByTestId("unblock-button");
    fireEvent.click(unblockButtons[0]);

    expect(mockMutate).toHaveBeenCalledWith("1", expect.any(Object));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "User unblocked",
        description: "They have been removed from your blocked list.",
      });
    });
  });

  it("5. API error shows toast", async () => {
    (useBlockedUsers as jest.Mock).mockReturnValue({
      data: mockBlockedUsers,
      isLoading: false,
      isError: false,
    });

    mockMutate.mockImplementation((userId, options) => {
      // simulate error
      options.onError(new Error("Server error"));
    });

    render(<BlockedUsersList />);
    
    const unblockButtons = screen.getAllByTestId("unblock-button");
    fireEvent.click(unblockButtons[0]);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to unblock",
        description: "Server error",
      });
    });
  });
});
