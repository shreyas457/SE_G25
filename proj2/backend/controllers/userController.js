import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

/**
 * Creates a JWT token for a user
 * @param {string} id - The user's MongoDB _id
 * @returns {string} JWT token signed with JWT_SECRET
 */
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
}

/**
 * Authenticates a user and returns a JWT token
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and token or error message
 */
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message: "User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({success:false,message: "Invalid credentials"})
        }

        const token = createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

/**
 * Registers a new user account
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password (min 8 characters)
 * @param {Object} [req.body.address] - Optional address object
 * @param {string} [req.body.address.formatted] - Formatted address string
 * @param {number} [req.body.address.lat] - Latitude coordinate
 * @param {number} [req.body.address.lng] - Longitude coordinate
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and token or error message
 */
const registerUser = async (req,res) => {
    const {name, email, password, address} = req.body;
    try{
        //check if user already exists
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({success:false,message: "User already exists"})
        }

        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Please enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            ...(address && {
                address: {
                    formatted: address.formatted,
                    lat: address.lat,
                    lng: address.lng,
                },
            }),     
        });

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})

    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {loginUser, registerUser}