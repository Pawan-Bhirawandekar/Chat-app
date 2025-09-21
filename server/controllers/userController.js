import { genrateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";

//User registration
export const singup = async (req,res)=>{
    const {fullName, email, password, bio} = req.body;

    try{
        //condition check for missing data
        if(!fullName || !email || !password || !bio){
            return res.json({success : false, message : "Missing Details"})
        }

        //User already exist
        const user = await User.findOne({email});
        if(user){
            return res.json({success:true, message: "User already exists"})
        }

        //encrypt the user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creating new user
        const newUser = await User.create({
            fullName, email, password:hashedPassword, bio
        });

        //json token to authenticate user
        const token = genrateToken(newUser._id)
        res.json({success: true, userData: newUser, token, message:"Account created successfully"})


    }catch(error){
        console.log(error.message);
        
        res.json({success: false, message:error.message})
    }
}

//User login 
export const login = async (req, res)=>{
    try{
        const {email, password} =req.body;
        const userData = await User.findOne({email});

        // Check if user exists
        if(!userData){
            return res.json({success: false, message: "User does not exists"})
        }
        //compare password
        const isPasswordCorrect = await bcrypt.compare(password ,userData.password);
        
        //incorrect password
        if(!isPasswordCorrect){
            return res.json({success:false, message:"Invalid password"});
        }

        //if password is correct, gen token
        const token = genrateToken(userData._id);

        res.json({success: true, userData, token, message: "Login successful"})
    }catch(error){
        console.log(error.message);
        
        res.json({success: false, message:error.message})
    }
}

//check user is authenticated
export const checkAuth = (req, res)=>{
    res.json({success: true, user: req.user});
}

//update user profiledetilas
export const updateProfile = async(req,res)=>{
    try{
        const {profilePic, bio, fullName} = req.body;
        
        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser= await User.findByIdAndUpdate(userId, {bio, fullName},{new:true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic:upload.secure_url, bio, fullName}, {new:true});
        }

        res.json({success: true, user: updatedUser})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})   
    }
}