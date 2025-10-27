import React, { useContext, useState } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext';
import Food3DViewer from '../Food3DViewer/Food3DViewer';

const FoodItem = ({ image, name, price, desc, id, model3D }) => {

    const [itemCount, setItemCount] = useState(0);
    const [show3D, setShow3D] = useState(false);
    const {cartItems, addToCart, removeFromCart, url, currency} = useContext(StoreContext);

    return (
        <>
            <div className='food-item'>
                <div className='food-item-img-container'>
                    <img className='food-item-image' src={image || assets.default_food_image} alt="" />
                    
                    {/* 3D View Button */}
                    {model3D && (
                        <button 
                            className='view-3d-btn' 
                            onClick={() => setShow3D(true)}
                            title="View in 360°"
                        >
                            🔄 360°
                        </button>
                    )}
                    
                    {!cartItems[id]
                    ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
                    : <div className="food-item-counter">
                            <img src={assets.remove_icon_red} onClick={() => removeFromCart(id)} alt="" />
                            <p>{cartItems[id]}</p>
                            <img src={assets.add_icon_green} onClick={() => addToCart(id)} alt="" />
                        </div>
                    }
                </div>
                <div className="food-item-info">
                    <div className="food-item-name-rating">
                        <p>{name}</p> <img src={assets.rating_starts} alt="" />
                    </div>
                    <p className="food-item-desc">{desc}</p>
                    <p className="food-item-price">{currency}{price}</p>
                </div>
            </div>

            {/* 3D Modal */}
            {show3D && model3D && (
                <div className="food-3d-modal" onClick={() => setShow3D(false)}>
                    <div className="food-3d-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-3d-btn" onClick={() => setShow3D(false)}>
                            ✕
                        </button>
                        <h3>{name} - 360° View</h3>
                        <Food3DViewer modelPath={model3D} name={name} />
                    </div>
                </div>
            )}
        </>
    )
}

export default FoodItem