// import Message from "../models/Message.js";
// import User from "../models/User.js";
// import cloudinary from "../lib/cloudinary.js";
// import {io, userSocketmap} from "../server.js";


// //Get all user except the logged in user
// export const getUserForSidebar = async (req,res)=>{
//     try{
//         const userId = req.user._id;
//         const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");

//         //count no. of msg that are unseen
//         const unseenMessages ={}
//         const promises = filteredUsers.map(async (user)=>{
//             const messages = await Message.find({senderId: user._id, receiverId: userId, seen:false})

//             if(messages.length > 0){
//                 unseenMessages[user._id] = messages.length;
//             }
//         })
//         await Promise.all(promises);
//         res.json({success: true, users: filteredUsers, unseenMessages})
//     }catch(error){
//         console.log(error.message);
//         res.json({success: fasle, Message: error.message})
//     }   
// }

// //Get all messages for selected user
// export const getMessages = async(req, res)=>{
//     try{
//         const {id:selectedUserId} = req.params;
//         const myId = req.user._id;

//         const messages = await Message.find({
//             $or: [
//                 {senderId: myId, receiverId:selectedUserId},
//                 {senderId: selectedUserId, receiverId:myId},
//             ]
//         })
//         await Message.updateMany({senderId: selectedUserId, receiverId:myId}, {seen:true});

//         res.json({success:true, messages})
//     }catch(error){
//         console.log(error.message);
//         res.json({success: fasle, Message: error.message})
//     }
// }

// //Mark msg as seen using message id
// export const markMessageAsSeen = async(req, res)=>{
//     try{
//         const { id }=req.params;
//         await Message.findByIdAndUpdate(id, {seen:true})

//         res.json({success:true})
//     }catch(error){
//         console.log(error.message);
//         res.json({success: false, Message: error.message})
//     }
// }

// //send message to selected user
// export const sendMessage = async (req, res)=>{
//     try {
//         const {text, image} = req.body;
//         const receiverId = req.params.id;
//         const senderId = req.user._id;

//         let imageUrl;
//         if(image){
//             const uploadResponse = await cloudinary.uploader.upload(image)
//             imageUrl = uploadResponse.secure_url;
//         }

//         const newMessage = await Message.create({
//             senderId,
//             receiverId,
//             text,
//             image : imageUrl
//         })

//         //Emit the new messgae to the reciver's socket
//         const receiverSocketId = userSocketmap[receiverId];
//         if(receiverSocketId){
//             io.to(receiverSocketId).emit("newMessage", newMessage)
//         }
        
//         res.json({success : true, newMessage});


//     } catch (error) {
//         console.log(error.message);
//         res.json({success: false, Message: error.message})
//     }
// }


import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketmap } from "../server.js";

// ✅ Get all users except the logged-in user
export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    // Exclude logged-in user & hide password
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    // Count unseen messages for each user
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const count = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (count > 0) {
        unseenMessages[user._id] = count;
      }
    });

    await Promise.all(promises);

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get all messages between logged-in user and selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // Mark all messages from the selected user as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Mark a single message as seen
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params; // fix: extract properly
    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({ success: true });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Emit new message to receiver's socket if online
    const receiverSocketId = userSocketmap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
