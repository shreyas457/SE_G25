import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Add from "../Add/Add";
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

describe("Add Page (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render add food form", () => {
    render(<Add />);

    expect(screen.getByText("Upload image")).toBeInTheDocument();
    expect(screen.getByText("Product name")).toBeInTheDocument();
    expect(screen.getByText("Product description")).toBeInTheDocument();
    expect(screen.getByText("Product category")).toBeInTheDocument();
    expect(screen.getByText("Product Price")).toBeInTheDocument();
    expect(screen.getByText("ADD")).toBeInTheDocument();
  });

  it("should handle input changes", () => {
    render(<Add />);

    const nameInput = screen.getByPlaceholderText("Type here");
    fireEvent.change(nameInput, { target: { value: "Test Food" } });

    expect(nameInput.value).toBe("Test Food");
  });

  it("should show error if image not selected on submit", async () => {
    render(<Add />);

    const nameInput = screen.getByPlaceholderText("Type here");
    const descriptionInput = screen.getByPlaceholderText("Write content here");
    const priceInput = screen.getByPlaceholderText("25");
    const submitButton = screen.getByText("ADD");

    fireEvent.change(nameInput, { target: { value: "Test Food" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });
    fireEvent.change(priceInput, { target: { value: "10.99" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Image not selected");
    });
  });

  it("should submit form with all data", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: "Food Added" },
    });

    render(<Add />);

    const nameInput = screen.getByPlaceholderText("Type here");
    const descriptionInput = screen.getByPlaceholderText("Write content here");
    const priceInput = screen.getByPlaceholderText("25");
    const imageInput = document.querySelector('input[type="file"]');
    const submitButton = screen.getByText("ADD");

    // Create a mock file
    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(nameInput, { target: { value: "Test Food" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });
    fireEvent.change(priceInput, { target: { value: "10.99" } });
    fireEvent.change(imageInput, { target: { files: [file] } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Food Added");
    });
  });

  it("should reset form after successful submission", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: "Food Added" },
    });

    render(<Add />);

    const nameInput = screen.getByPlaceholderText("Type here");
    const descriptionInput = screen.getByPlaceholderText("Write content here");
    const priceInput = screen.getByPlaceholderText("25");
    const imageInput = document.querySelector('input[type="file"]');
    const submitButton = screen.getByText("ADD");

    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(nameInput, { target: { value: "Test Food" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });
    fireEvent.change(priceInput, { target: { value: "10.99" } });
    fireEvent.change(imageInput, { target: { files: [file] } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(descriptionInput.value).toBe("");
    });
  });

  it("should handle category selection", () => {
    render(<Add />);

    const categorySelect = screen.getByDisplayValue("Salad");
    fireEvent.change(categorySelect, { target: { value: "Rolls" } });

    expect(categorySelect.value).toBe("Rolls");
  });

  it("should show error on failed submission", async () => {
    axios.post.mockResolvedValue({
      data: { success: false, message: "Error adding food" },
    });

    render(<Add />);

    const nameInput = screen.getByPlaceholderText("Type here");
    const descriptionInput = screen.getByPlaceholderText("Write content here");
    const priceInput = screen.getByPlaceholderText("25");
    const imageInput = document.querySelector('input[type="file"]');
    const submitButton = screen.getByText("ADD");

    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(nameInput, { target: { value: "Test Food" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });
    fireEvent.change(priceInput, { target: { value: "10.99" } });
    fireEvent.change(imageInput, { target: { files: [file] } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error adding food");
    });
  });
});
