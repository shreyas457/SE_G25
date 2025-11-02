import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const ShelterIcon = () => (
  <svg
    width="22" height="22" viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
  >
    <path d="M3 10.5L12 4l9 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-8z"
          stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M9 19v-5h6v5M12 8v3M10.5 9.5h3"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Items</p>
        </NavLink>

        <NavLink to='/list' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Items</p>
        </NavLink>

        <NavLink to='/orders' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>

        {/* Shelters with inline SVG icon (no asset dependency) */}
        <NavLink to='/shelters' className="sidebar-option">
          <span className="sidebar-svg"><ShelterIcon /></span>
          <p>Shelters</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
