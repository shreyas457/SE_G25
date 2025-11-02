import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Shelters from './pages/Shelters/Shelters'; // ⬅️ NEW
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShelterHistory from "./pages/ShelterHistory/ShelterHistory";
const App = () => {
  return (
    <div className='app'>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          {/* default -> /orders */}
          <Route path="/" element={<Navigate to="/orders" replace />} />

          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/shelters" element={<Shelters/>} />  {/* ⬅️ NEW */}
          <Route path="/shelter-history" element={<ShelterHistory />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
