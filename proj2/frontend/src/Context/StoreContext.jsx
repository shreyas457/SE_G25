import { createContext, useEffect, useState } from "react";
import { food_list, menu_list } from "../assets/assets";
import axios from "axios";
export const StoreContext = createContext(null);

/**
 * StoreContextProvider - Main context provider for application state
 * Manages food list, cart items, authentication token, and cart operations
 * @param {Object} props - React component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} StoreContext provider with context value
 */
const StoreContextProvider = (props) => {

    const url = "http://localhost:4000"
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("")
    const currency = "$";
    const deliveryCharge = 5;

    /**
     * Adds an item to the cart or increments its quantity
     * Also syncs with backend if user is authenticated
     * @param {string} itemId - MongoDB _id of the food item to add
     * @returns {Promise<void>}
     */
    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    }

    /**
     * Removes one quantity of an item from the cart
     * Also syncs with backend if user is authenticated
     * @param {string} itemId - MongoDB _id of the food item to remove
     * @returns {Promise<void>}
     */
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    }

    /**
     * Calculates the total amount of all items in the cart
     * @returns {number} Total cart amount in dollars
     */
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            try {
              if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }  
            } catch (error) {
                
            }
            
        }
        return totalAmount;
    }

    /**
     * Fetches the complete list of food items from the backend
     * @returns {Promise<void>}
     */
    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data)
    }

    /**
     * Loads cart data from the backend for an authenticated user
     * @param {Object} token - Token object with authentication token
     * @param {string} token.token - JWT authentication token
     * @returns {Promise<void>}
     */
    const loadCartData = async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, { headers: token });
        setCartItems(response.data.cartData);
    }

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"))
                await loadCartData({ token: localStorage.getItem("token") })
            }
        }
        loadData()
    }, [])

    const contextValue = {
        url,
        food_list,
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
        deliveryCharge
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}

export default StoreContextProvider;