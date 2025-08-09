import React, { useState } from "react";
import { FaUser, FaBook, FaImages, FaBars, FaTimes } from "react-icons/fa";
// import { FaBasketShopping } from "react-icons/fa6";
// import { IoIosWater } from "react-icons/io";
import logo from "../../assets/conversia-lg.png";

interface ResponsiveHeaderProps {
  setModelUrl: (url: string) => void;
  setBackgroundUrl: (url: string) => void;
  setModelId: (id: number) => void;
  userId: number;
  setShowProfile: (val: boolean) => void;
  setShowAvatar: (val: boolean) => void;
  setShowBackground: (val: boolean) => void;
  // setShowNft: (val: boolean) => void;
  // setShowMarket: (val: boolean) => void;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  setShowProfile,
  setShowAvatar,
  setShowBackground,
  // setShowNft,
  // setShowMarket,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-40 bg-white/10 backdrop-blur-xl rounded-full shadow-md px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Conversia Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Hamburger Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center space-y-6 text-white text-lg">
          <button
            onClick={() => {
              setShowProfile(true);
            }}
          >
            <FaBook className="inline mr-2" /> Profile
          </button>
          <button
            onClick={() => {
              setShowBackground(true);
              setMenuOpen(false);
            }}
          >
            <FaImages className="inline mr-2" /> Background
          </button>
          <button
            onClick={() => {
              setShowAvatar(true);
              setMenuOpen(false);
            }}
          >
            <FaUser className="inline mr-2" /> Avatar
          </button>
          {/* <button
            onClick={() => {
              setShowNft(true);
            }}
          >
            <IoIosWater className="inline mr-2" /> NFT
          </button> */}
          {/* <button
            onClick={() => {
              setShowMarket(true);
            }}
          >
            <FaBasketShopping className="inline mr-2" /> Shop
          </button> */}
          {/* {wallet.status === "connected" && (
            <button onClick={wallet.disconnect} className="text-red-400">
              ❌ Disconnect
            </button>
          )} */}
          {localStorage.getItem("metamask_account") && (
            <button
              onClick={() => {
                localStorage.removeItem("metamask_account");
                localStorage.removeItem("userId");
                window.location.href = "/landing";
              }}
              className="text-red-400"
            >
              ❌ Disconnect
            </button>
          )}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-0 right-0 mr-4 px-4 py-2 text-xl hover:bg-gray-700 transition"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </>
  );
};

export default ResponsiveHeader;
