import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ExploreMenu from "../ExploreMenu/ExploreMenu";
import { StoreContext } from "../../Context/StoreContext";

const mockMenu = [
  { menu_name: "Pizza", menu_image: "/pizza.png" },
  { menu_name: "Sushi", menu_image: "/sushi.png" },
];

const renderWithStore = (ui, value) =>
  render(<StoreContext.Provider value={value}>{ui}</StoreContext.Provider>);

describe("ExploreMenu", () => {
  it("renders and toggles category", () => {
    const setCategory = vi.fn();
    renderWithStore(<ExploreMenu category="All" setCategory={setCategory} />, {
      menu_list: mockMenu,
    });
    expect(screen.getByText("Explore Our Menu")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Pizza"));
    expect(setCategory).toHaveBeenCalled();
  });
});
