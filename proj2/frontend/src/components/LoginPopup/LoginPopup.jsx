import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ setShowLogin }) => {
  const { setToken, url, loadCartData } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Sign Up");

  // ✅ existing form data + address fields
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    addressFormatted: "",
    addressLat: "",
    addressLng: "",
  });

  // ✅ for address suggestions
  const [suggestions, setSuggestions] = useState([]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  // ✅ handle address typing (free OpenStreetMap autocomplete)
  const handleAddressChange = async (e) => {
    const query = e.target.value;
    setData({ ...data, addressFormatted: query });

    // only query API if user typed at least 3 chars
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.error("Error fetching address suggestions:", err);
    }
  };

  // ✅ when a user selects a suggestion
  const handleSelectSuggestion = (place) => {
    setData({
      ...data,
      addressFormatted: place.display_name,
      addressLat: place.lat,
      addressLng: place.lon,
    });
    setSuggestions([]); // hide dropdown
  };

  const onLogin = async (e) => {
    e.preventDefault();

    let new_url = url;
    if (currState === "Login") {
      new_url += "/api/user/login";
    } else {
      new_url += "/api/user/register";
    }

    // ✅ only add address if we're signing up
    let payload = { ...data };
    if (currState === "Sign Up") {
      payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        address: {
          formatted: data.addressFormatted,
          lat: data.addressLat,
          lng: data.addressLng,
        },
      };
    }

    try {
      const response = await axios.post(new_url, payload);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        loadCartData({ token: response.data.token });
        setShowLogin(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while logging in or signing up.");
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" ? (
            <>
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Your name"
                required
              />

              {/* ✅ Free OpenStreetMap autocomplete input */}
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Enter your address"
                  value={data.addressFormatted}
                  onChange={handleAddressChange}
                  required
                  autoComplete="off"
                />
                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <ul
                    style={{
                      listStyle: "none",
                      background: "#fff",
                      border: "1px solid #ccc",
                      padding: 0,
                      margin: 0,
                      position: "absolute",
                      width: "100%",
                      zIndex: 1000,
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {suggestions.map((s) => (
                      <li
                        key={s.place_id}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                        onClick={() => handleSelectSuggestion(s)}
                      >
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}

          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Password"
            required
          />
        </div>

        <button>{currState === "Login" ? "Login" : "Create account"}</button>

        <div className="login-popup-condition">
          <input type="checkbox" name="" id="" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
