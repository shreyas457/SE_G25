import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets"; // ⬅️ keep only what you actually need here
import axios from "axios";

export const StoreContext = createContext({
  url: "",
  food_list: [],
  menu_list: [],
  cartItems: {},
  addToCart: () => {},
  removeFromCart: () => {},
  getTotalCartAmount: () => 0,
  token: "",
  setToken: () => {},
  loadCartData: () => {},
  setCartItems: () => {},
  currency: "$",
  deliveryCharge: 5,
});

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000";

  // ✅ rename to avoid clashing with the imported constant name
  const [foods, setFoods] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const currency = "$";
  const deliveryCharge = 5;

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev?.[itemId] ?? 0) + 1 }));
    if (token) {
      await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token } });
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev?.[itemId] ?? 0) - 1, 0) }));
    if (token) {
      await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } });
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const qty = cartItems[itemId] ?? 0;
      if (qty > 0) {
        const itemInfo = foods.find((p) => p._id === itemId);
        if (itemInfo) total += (itemInfo.price ?? 0) * qty;
      }
    }
    return total;
  };

  const fetchFoodList = async () => {
    const res = await axios.get(`${url}/api/food/list`);
    setFoods(res.data?.data ?? []);
  };

  const loadCartData = async ({ token }) => {
    const res = await axios.post(`${url}/api/cart/get`, {}, { headers: { token } });
    setCartItems(res.data?.cartData ?? {});
  };

  useEffect(() => {
    (async () => {
      await fetchFoodList();
      const t = localStorage.getItem("token");
      if (t) {
        setToken(t);
        await loadCartData({ token: t });
      }
    })();
  }, []);

  const contextValue = {
    url,
    food_list: foods,      // ⬅️ expose the stateful list to consumers
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    loadCartData,
    setCartItems,
    currency,
    deliveryCharge,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
