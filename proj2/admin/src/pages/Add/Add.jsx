import React, { useState } from "react";
import "./Add.css";
import { assets, url } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = () => {
  const [image, setImage] = useState(false);
  const [model3D, setModel3D] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB in bytes

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `File size exceeds 12MB. Selected file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
        );
        e.target.value = "";
        return;
      }
      setModel3D(file);
      e.target.value = "";
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Image not selected");
      return null;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);

    // Append 3D model if selected
    if (model3D) {
      formData.append("model3D", model3D);
    }

    const response = await axios.post(`${url}/api/food/add`, formData);
    if (response.data.success) {
      toast.success(response.data.message);
      setData({
        name: "",
        description: "",
        price: "",
        category: data.category,
      });
      setImage(false);
      setModel3D(false);
    } else {
      toast.error(response.data.message);
    }
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload image</p>
          <input
            onChange={(e) => {
              setImage(e.target.files[0]);
              e.target.value = "";
            }}
            type="file"
            accept="image/*"
            id="image"
            hidden
          />
          <label htmlFor="image">
            <img
              src={!image ? assets.upload_area : URL.createObjectURL(image)}
              alt=""
            />
          </label>
        </div>

        {/* 3D Model Upload Section */}
        <div className="add-model-upload flex-col">
          <p>Upload 3D Model (Optional - Max 12MB)</p>
          <input
            onChange={handleModelUpload}
            type="file"
            accept=".glb,.gltf"
            id="model3D"
            hidden
          />
          <label htmlFor="model3D" className="model-upload-label">
            {!model3D ? (
              <div className="model-upload-placeholder">
                <p>📦 Click to upload GLB/GLTF file</p>
                <small>Maximum file size: 12MB</small>
              </div>
            ) : (
              <div className="model-upload-success">
                <p>✅ {model3D.name}</p>
                <span>({(model3D.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </label>
          {model3D && (
            <button
              type="button"
              className="remove-model-btn"
              onClick={() => setModel3D(false)}
            >
              Remove Model
            </button>
          )}
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input
            name="name"
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            placeholder="Type here"
            required
          />
        </div>
        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea
            name="description"
            onChange={onChangeHandler}
            value={data.description}
            type="text"
            rows={6}
            placeholder="Write content here"
            required
          />
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select name="category" onChange={onChangeHandler}>
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input
              type="Number"
              name="price"
              onChange={onChangeHandler}
              value={data.price}
              placeholder="25"
            />
          </div>
        </div>
        <button type="submit" className="add-btn">
          ADD
        </button>
      </form>
    </div>
  );
};

export default Add;
