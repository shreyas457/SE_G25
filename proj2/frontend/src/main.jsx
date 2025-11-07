import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./Context/StoreContext";
import { ThemeProvider } from "./Context/ThemeContext.jsx";
import { SocketProvider } from "./Context/SocketContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <StoreContextProvider>
          <SocketProvider url="http://localhost:4000">
            <App />
          </SocketProvider>
        </StoreContextProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
