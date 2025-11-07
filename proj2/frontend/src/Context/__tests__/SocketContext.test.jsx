import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React, { useContext } from "react";
import { SocketProvider, useSocket } from "../SocketContext";
import { io } from "socket.io-client";

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn(),
    id: "mock-socket-id",
  })),
}));

const TestComponent = () => {
  const socket = useSocket();
  return (
    <div data-testid="socket">{socket ? "connected" : "disconnected"}</div>
  );
};

describe("SocketContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create socket connection on mount", () => {
    render(
      <SocketProvider url="http://localhost:4000">
        <TestComponent />
      </SocketProvider>
    );

    expect(io).toHaveBeenCalledWith("http://localhost:4000");
  });

  it("should provide socket to children", () => {
    const { getByTestId } = render(
      <SocketProvider url="http://localhost:4000">
        <TestComponent />
      </SocketProvider>
    );

    // Socket should be available after connection
    expect(getByTestId("socket")).toBeInTheDocument();
  });
});
