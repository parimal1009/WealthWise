import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Home, MessageCircle, BookOpen, Settings, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import { APP_NAME } from "../../utils/constants";

const SideNavComponent = ({ userData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    { name: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Learn", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];
  const handleClick = () => {
    navigate("/profile");
  };

  const hasAvatar = userData.avatar && userData.avatar.trim() !== "";

  return (
    <div className="bg-white overflow-hidden">
      <div className="flex items-center mb-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.jpg" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
        </Link>
      </div>
      {/* Profile Section */}
      <div className="bg-gradient-to-br rounded-2xl from-blue-600/40 via-indigo-600/70 to-purple-700/70 p-6 text-white relative">
        {/* Decorations */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>

        <div className="text-center relative z-10">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full p-1 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              {!hasAvatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <User className="w-12 h-12 text-white opacity-80" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          <h3 className="font-bold text-xl mb-1">{user.name}</h3>
          <p className="text-blue-100 text-sm opacity-90">{user.email}</p>

          <button
            onClick={handleClick}
            className="w-full mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 border border-white/20"
          >
            View Full Profile
          </button>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="p-6">
        <ul className="space-y-3">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <li
                key={idx}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </li>
            </Link>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideNavComponent;
