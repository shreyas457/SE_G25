import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "../Navbar/Navbar";

describe("Navbar (Admin)", () => {
  it("should render navbar with logo", () => {
    const { container } = render(<Navbar />);

    const logo = container.querySelector(".logo");
    expect(logo).toBeInTheDocument();
  });

  it("should render profile image", () => {
    const { container } = render(<Navbar />);

    const profileImage = container.querySelector(".profile");
    expect(profileImage).toBeInTheDocument();
  });

  it("should have navbar class", () => {
    const { container } = render(<Navbar />);

    const navbar = container.querySelector(".navbar");
    expect(navbar).toBeInTheDocument();
  });
});
