import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import Orders from "../Orders/Orders";
import axios from "axios";
import { toast } from "react-toastify";

// Mock axios and toast
vi.mock("axios");
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockOrders = [
  {
    _id: "order1",
    items: [
      { name: "Food 1", quantity: 2 },
      { name: "Food 2", quantity: 1 },
    ],
    address: {
      firstName: "John",
      lastName: "Doe",
      street: "123 Main St",
      city: "Raleigh",
      state: "NC",
      country: "USA",
      zipcode: "27601",
      phone: "123-456-7890",
    },
    amount: 25.99,
    status: "Food Processing",
  },
  {
    _id: "order2",
    items: [{ name: "Food 3", quantity: 1 }],
    address: {
      firstName: "Jane",
      lastName: "Smith",
      street: "456 Oak Ave",
      city: "Durham",
      state: "NC",
      country: "USA",
      zipcode: "27701",
      phone: "987-654-3210",
    },
    amount: 15.99,
    status: "Cancelled",
  },
];

describe("Orders Page (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render orders page with header", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    await act(async () => {
      render(<Orders />);
    });

    expect(screen.getByText("Order Page")).toBeInTheDocument();
  });

  it("should display tabs for current and cancelled orders", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockOrders },
    });

    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText(/Current/)).toBeInTheDocument();
      expect(screen.getByText(/Cancelled/)).toBeInTheDocument();
    });
  });

  it("should display current orders by default", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockOrders },
    });

    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  it("should switch to cancelled orders tab", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockOrders },
    });

    render(<Orders />);

    await waitFor(() => {
      const cancelledTab = screen.getByText(/Cancelled/);
      fireEvent.click(cancelledTab);
    });

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  it("should display order details", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockOrders },
    });

    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      expect(screen.getByText("$25.99")).toBeInTheDocument();
      expect(screen.getByText(/Items : 2/)).toBeInTheDocument();
    });
  });

  it("should handle status update", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockOrders },
    });
    axios.post.mockResolvedValue({
      data: { success: true },
    });

    render(<Orders />);

    await waitFor(() => {
      const statusSelect = screen.getAllByRole("combobox")[0];
      fireEvent.change(statusSelect, { target: { value: "Out for delivery" } });
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("should disable status select for terminal statuses", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockOrders },
    });

    render(<Orders />);

    await waitFor(() => {
      const cancelledTab = screen.getByText(/Cancelled/);
      fireEvent.click(cancelledTab);
    });

    await waitFor(() => {
      const statusSelects = screen.getAllByRole("combobox");
      const cancelledOrderSelect = statusSelects.find(
        (select) => select.value === "Cancelled"
      );
      expect(cancelledOrderSelect).toBeDisabled();
    });
  });

  it("should show empty state when no orders", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    render(<Orders />);

    await waitFor(() => {
      expect(
        screen.getByText(/No current orders right now/)
      ).toBeInTheDocument();
    });
  });

  it("should show error on fetch failure", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    render(<Orders />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Network error while fetching orders"
      );
    });
  });

  it("should show error on status update failure", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockOrders },
    });
    axios.post.mockResolvedValue({
      data: { success: false, message: "Update failed" },
    });

    render(<Orders />);

    await waitFor(() => {
      const statusSelect = screen.getAllByRole("combobox")[0];
      fireEvent.change(statusSelect, { target: { value: "Out for delivery" } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Update failed");
    });
  });
});
