import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface SidebarLinkProps {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  isActive?: boolean;
}

const SidebarLink = ({ to, icon, children, isActive = false }: SidebarLinkProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
        isActive
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
          : "text-gray-700 hover:bg-gray-50 hover:text-purple-600"
      }`}
    >
      <div className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-purple-600"}`}>
        {icon}
      </div>
      <span className={`font-medium ${isActive ? "text-white" : "group-hover:text-purple-600"}`}>
        {children}
      </span>
    </Link>
  );
};

export default SidebarLink;