import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideNavComponent from "./SideNavComponent";

const ParentComponent = ({ userData }) => {
  const navigate = useNavigate();

  const handleNavClick = (page) => {
    navigate(page === "home" ? "/home" : `/home/${page}`);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <div className="flex max-h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-gray-200 shadow-xl">
          <div className="p-6">
            <SideNavComponent userData={userData} onNavClick={handleNavClick} />
          </div>
        </div>

        {/* Main Content */}
        <Outlet />
      </div>
    </div>
  );
};

export default ParentComponent;
