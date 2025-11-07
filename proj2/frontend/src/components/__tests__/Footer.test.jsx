import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Footer from "../Footer/Footer";

describe("Footer", () => {
  it("should render footer component", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector(".footer");
    expect(footer).toBeInTheDocument();
  });

  it("should render footer content", () => {
    const { container } = render(<Footer />);

    // Footer typically contains links or text
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should have footer id", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector("#footer");
    expect(footer).toBeInTheDocument();
  });
});
