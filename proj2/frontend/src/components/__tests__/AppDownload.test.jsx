import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AppDownload from "../AppDownload/AppDownload";

describe("AppDownload", () => {
  it("renders support and feedback text", () => {
    render(<AppDownload />);
    expect(screen.getByText(/Customer support/i)).toBeInTheDocument();
    expect(screen.getByText(/feedback/i)).toBeInTheDocument();
  });
});
