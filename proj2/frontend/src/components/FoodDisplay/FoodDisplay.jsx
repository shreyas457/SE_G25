import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'

const FoodDisplay = ({category}) => {

  const {food_list} = useContext(StoreContext);

  return (
    <div className='food-display' id='food-display'>
      <h2>Top dishes near you</h2>
      <div className='food-display-list'>
        {food_list.map((item, index) => {
            const imageUrl = item.image && item.image.data 
                ? `data:${item.image.contentType};base64,${item.image.data}`
                : assets.default_food_image;
            
            return (
                <FoodItem
                    key={index}
                    image={imageUrl}
                    name={item.name}
                    desc={item.description}
                    price={item.price}
                    id={item._id}
                    model3D={item.model3D}
                />
            )
        })}
      </div>
    </div>
  )
}

export default FoodDisplay
