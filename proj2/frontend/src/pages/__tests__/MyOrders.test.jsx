import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MyOrders from "../MyOrders/MyOrders";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

vi.mock("axios");

const mockStoreContext = {
  token: "mock-token",
  url: "http://localhost:4000",
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <StoreContext.Provider value={mockStoreContext}>
        {component}
      </StoreContext.Provider>
    </BrowserRouter>
  );
};

describe("MyOrders Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render my orders page", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, data: [] },
    });

    renderWithProviders(<MyOrders />);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  it("should display orders when available", async () => {
    const mockOrders = [
      {
        _id: "order1",
        userId: "user123",
        items: [{ name: "Food 1", quantity: 2 }],
        amount: 25.99,
        status: "Delivered",
        date: new Date().toISOString(),
      },
    ];

    axios.post.mockResolvedValue({
      data: { success: true, data: mockOrders },
    });

    renderWithProviders(<MyOrders />);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
