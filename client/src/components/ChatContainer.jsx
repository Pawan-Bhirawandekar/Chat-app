import React, { useContext, useEffect, useRef, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {messages, selectedUser, setSelecteduser, sendMessage, getMessages } = useContext(ChatContext);

  const {authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();

  const [input, setInput] = useState('');

  //Handle sending message
  const handleSendMessage = async (e)=>{
    e.preventDefault();
    if(input.trim() === "") return null;
    await sendMessage({text : input.trim()});
    setInput("")
  }

  // Handle sending an Image

  const handelSendImage = async (e)=>{
    const file = e.target.files[0];
    if(!file || !file.type.startsWith("image/")){
      toast.error("Select an Image File.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async ()=>{
      await sendMessage({image: reader.result})
      e.target.value = ""
    }
    reader.readAsDataURL(file)
  }

  useEffect(()=>{
    if(selectedUser){
      getMessages(selectedUser._id)
    }
  },[selectedUser])

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages]); // scroll when msgs or user changes

  return selectedUser ? (
    <div className="h-full flex flex-col overflow-hidden relative backdrop-blur-lg">
      {/* ---------Header--------- */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser?.fullName || "Unknown"}
          <span className={`w-2 h-2 rounded-full ${onlineUsers.includes(selectedUser?._id) ? "bg-green-500" : "bg-gray-400"}`}></span>
        </p>
        {/* back arrow for mobile */}
        <img
          onClick={() => setSelecteduser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden w-6 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          alt=""
          className="hidden md:block w-6 cursor-pointer"
        />
      </div>

      {/* --------------Chat area------------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${
              msg.senderId !== authUser._id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {/* Message bubble */}
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-words text-white ${
                  msg.senderId === authUser._id
                    ? "bg-violet-500/30 rounded-br-none"
                    : "bg-gray-700/50 rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}

            {/* Avatar + time */}
            <div className="text-center text-xs text-gray-400">
              <img
                src={
                  msg.senderId === authUser._id ? authUser?.profilePic ||
                     assets.avatar_icon : selectedUser?.profilePic ||
                     assets.avatar_icon
                }
                alt=""
                className="w-7 h-7 rounded-full mx-auto"
              />
              <p>{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* ----------Bottom Input Area----------- */}
      <div className="sticky bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-gray-900/70 backdrop-blur-md">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input onChange={(e)=>setInput(e.target.value)} value={input} onKeyDown={(e)=>e.key === "Enter" ? handleSendMessage(e) : null}
            type="text"
            placeholder="send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input onChange={handelSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="Upload"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img onClick={handleSendMessage}
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    // ---------No user selected (blank state)-----------
    <div className="flex flex-col gap-4 p-4 overflow-y-auto items-center justify-center bg-white/10">
      <img src={assets.logo_icon} className="w-16" alt="" />
      <p className="text-lg font-medium text-white text-center">
        Stay Connected. Anytime. Anywhere. Instantly.
      </p>
    </div>
  );
};

export default ChatContainer;
