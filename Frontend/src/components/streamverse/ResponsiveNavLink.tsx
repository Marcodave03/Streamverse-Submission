import { Link, LinkProps } from "react-router-dom";
import { ReactNode } from "react";

interface ResponsiveNavLinkProps extends Omit<LinkProps, "children"> {
  active?: boolean;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
}

const ResponsiveNavLink = ({
  active = false,
  className = "",
  children,
  icon,
  ...props
}: ResponsiveNavLinkProps) => {
  return (
    <Link
      {...props}
      className={`group flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] ${
        active
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 border-l-4 border-white/30"
          : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 border-l-4 border-transparent hover:border-purple-300"
      } ${className}`}
    >
      {icon && (
        <span
          className={`transition-all duration-200 ${
            active
              ? "text-white scale-110"
              : "text-gray-600 group-hover:text-purple-600 group-hover:scale-110"
          }`}
        >
          {icon}
        </span>
      )}
      <span
        className={`transition-all duration-200 ${
          active
            ? "text-white font-semibold"
            : "text-gray-700 group-hover:text-purple-600 group-hover:font-semibold"
        }`}
      >
        {children}
      </span>
    </Link>
  );
};

export default ResponsiveNavLink;
