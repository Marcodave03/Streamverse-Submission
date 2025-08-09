import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "react-feather";
import ResponsiveNavLink from "./ResponsiveNavLink";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:px-8 md:pt-4 fixed w-full z-50">
      <nav className="flex justify-end sm:justify-between items-center px-8 py-6 sm:py-4 drop-shadow-md bg-white sm:rounded-2xl">
        <div>
          <ul className="hidden sm:flex space-x-8">
            <li>
              <Link
                to="#"
                className="text-gray-700 text-lg font-medium hover:text-purple-500"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-gray-700 text-lg font-medium hover:text-purple-500"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-gray-700 text-lg font-medium hover:text-purple-500"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-gray-700 text-lg font-medium hover:text-purple-500"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="hidden sm:flex gap-4">
          <Button>Login</Button>
          <Button variant={"secondary"}>Sign Up</Button>
        </div>
        <div className="-me-2 flex items-center sm:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } sm:hidden absolute top-16 left-0 right-0 bg-white shadow-md rounded-lg z-10 p-4`}
        >
          <ul className="flex flex-col">
            <li>
              <ResponsiveNavLink to="#" active={true}>
                Home
              </ResponsiveNavLink>
            </li>
            <li>
              <ResponsiveNavLink to="#">About</ResponsiveNavLink>
            </li>
            <li>
              <ResponsiveNavLink to="#">Services</ResponsiveNavLink>
            </li>
            <li>
              <ResponsiveNavLink to="#">Contact</ResponsiveNavLink>
            </li>
            <div className="pb-1 border-t border-gray-200">
              <div className="mt-2 space-y-1">
                <Button>Login</Button>
              </div>
              <div className="mt-2 space-y-1">
                <Button variant={"secondary"}>Sign Up</Button>
              </div>
            </div>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
