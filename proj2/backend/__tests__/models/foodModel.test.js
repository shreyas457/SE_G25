import { describe, it, expect } from "@jest/globals";
import foodModel from "../../models/foodModel.js";

describe("Food Model", () => {
  it("should create a food item with required fields", () => {
    const foodData = {
      name: "Test Food",
      description: "Food description",
      price: 10.99,
      category: "Category",
    };

    const food = new foodModel(foodData);

    expect(food.name).toBe("Test Food");
    expect(food.description).toBe("Food description");
    expect(food.price).toBe(10.99);
    expect(food.category).toBe("Category");
  });

  it("should allow image data and contentType", () => {
    const foodData = {
      name: "Test Food",
      description: "Food description",
      price: 10.99,
      category: "Category",
      image: {
        data: Buffer.from("image-data"),
        contentType: "image/png",
      },
    };

    const food = new foodModel(foodData);

    expect(food.image.data).toBeDefined();
    expect(food.image.contentType).toBe("image/png");
  });

  it("should require name field", () => {
    const foodData = {
      description: "Food description",
      price: 10.99,
      category: "Category",
    };

    const food = new foodModel(foodData);
    const error = food.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it("should require description field", () => {
    const foodData = {
      name: "Test Food",
      price: 10.99,
      category: "Category",
    };

    const food = new foodModel(foodData);
    const error = food.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.description).toBeDefined();
  });

  it("should require price field", () => {
    const foodData = {
      name: "Test Food",
      description: "Food description",
      category: "Category",
    };

    const food = new foodModel(foodData);
    const error = food.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.price).toBeDefined();
  });

  it("should require category field", () => {
    const foodData = {
      name: "Test Food",
      description: "Food description",
      price: 10.99,
    };

    const food = new foodModel(foodData);
    const error = food.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.category).toBeDefined();
  });
});
