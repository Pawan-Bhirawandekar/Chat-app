import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useDebounce } from "use-debounce";

const SlideBar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const [debouncedInput] = useDebounce(input, 300);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Memoized user filtering
  const filteredUsers = useMemo(() => {
    return debouncedInput
      ? users.filter((user) =>
          user?.fullName?.toLowerCase().includes(debouncedInput.toLowerCase())
        )
      : users;
  }, [debouncedInput, users]);

  // Load users initially and whenever onlineUsers change
  useEffect(() => {
    getUsers();
  }, [onlineUsers, getUsers]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Stable callback for selecting user
  const handleSelectUser = useCallback(
    (user) => {
      setSelectedUser(user);
    },
    [setSelectedUser]
  );

  return (
    <div
      className={`bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Top bar */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          {/* Menu Dropdown */}
          <div className="relative py-2" ref={menuRef}>
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setMenuOpen((prev) => !prev)}
            />
            {menuOpen && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
                <p
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex flex-col">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-400 text-sm p-4">No users found</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelectUser(user)}
              onKeyDown={(e) => e.key === "Enter" && handleSelectUser(user)}
              key={user._id}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
                selectedUser?._id === user._id ? "bg-[#282142]/50" : ""
              }`}
            >
              <img
                src={user?.profilePic || assets.avatar_icon}
                alt="profile"
                className="w-[35px] aspect-[1/1] rounded-full"
              />
              <div className="flex flex-col leading-5">
                <p>{user?.fullName || "Unnamed User"}</p>
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-neutral-400 text-xs">Offline</span>
                )}
              </div>
              {unseenMessages?.[user._id] > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SlideBar;
