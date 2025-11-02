import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";

export default function FoodItem({ image, name, price, desc, id, _id }) {
  // Always handle both id / _id to avoid undefined
  const itemId = id ?? _id;

  const ctx = useContext(StoreContext) ?? {};
  const {
    cartItems = {},
    addToCart = () => {},
    removeFromCart = () => {},
    url = "",
    currency = "$",
  } = ctx;

  // If we still don't have an ID, don't render to avoid crashes
  if (!itemId) return null;

  // Robust image source (works for relative filenames from backend)
  const imgSrc =
    image && /^https?:\/\//i.test(image) ? image : image ? `${url}/${image}` : assets.default_food_image;

  const count = cartItems?.[itemId] ?? 0;

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={imgSrc} alt={name ?? "food"} />
        {count === 0 ? (
          <img
            className="add"
            onClick={() => addToCart(itemId)}
            src={assets.add_icon_white}
            alt="add"
          />
        ) : (
          <div className="food-item-counter">
            <img src={assets.remove_icon_red} onClick={() => removeFromCart(itemId)} alt="remove" />
            <p>{count}</p>
            <img src={assets.add_icon_green} onClick={() => addToCart(itemId)} alt="add" />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="rating" />
        </div>
        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">
          {currency}
          {price}
        </p>
      </div>
    </div>
  );
}
