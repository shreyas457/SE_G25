import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import List from "../List/List";
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

const mockFoods = [
  {
    _id: "food1",
    name: "Food Item 1",
    description: "Description 1",
    price: 10.99,
    category: "Salad",
    image: "data:image/png;base64,test",
  },
  {
    _id: "food2",
    name: "Food Item 2",
    description: "Description 2",
    price: 15.99,
    category: "Rolls",
    image: "data:image/png;base64,test",
  },
];

describe("List Page (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render list page", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockFoods },
    });

    render(<List />);

    await waitFor(() => {
      expect(screen.getByText("All Foods List")).toBeInTheDocument();
    });
  });

  it("should display food items", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockFoods },
    });

    render(<List />);

    await waitFor(() => {
      expect(screen.getByText("Food Item 1")).toBeInTheDocument();
      expect(screen.getByText("Food Item 2")).toBeInTheDocument();
    });
  });
});
