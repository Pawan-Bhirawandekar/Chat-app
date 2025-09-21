// import jwt from "jsonwebtoken";
// import User from "../../models/User.js";


// // middleware to protect routes
// export const protectRoute = async(req, res, next)=>{
//     try{
//         const token =req.headers.token;

//         const decoded = jwt.verify(token, process.env.JWT_SECRET)

//         const user = await User.findOne(decoded.userId).select("-password");

//         if(!user) return res.json({success: false, message: "User not found"});

//         req.user = user;
//         next();
//     }catch(error){
//         console.log(error.message);

//         return res.json({success: false, message: error.message})
//     }
// }

import jwt from "jsonwebtoken";
import User from "../../models/User.js";

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    // ✅ FIX 1: handle both `req.headers.token` and `Authorization: Bearer <token>`
    const token = req.headers.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ❌ WRONG:
    // const user = await User.findOne(decoded.userId).select("-password");

    // ✅ FIX 2: use findById instead of findOne (this solves the error)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      // ✅ FIX 3: proper HTTP status code for missing user
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error.message);

    // ✅ FIX 4: return 401 on token/auth errors
    return res.status(401).json({ success: false, message: error.message });
  }
};
