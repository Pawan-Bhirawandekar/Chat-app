//import { JsonWebTokenError } from "jsonwebtoken";
import jwt from "jsonwebtoken"

//Funtion to genrate token to authenticate the user
export const genrateToken = (userId)=>{
    const token =jwt.sign({userId}, process.env.JWT_SECRET)
    return token;
}