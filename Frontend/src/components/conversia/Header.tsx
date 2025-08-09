// import React, { useState, useEffect } from "react";
// import { FaUser, FaBook, FaImages } from "react-icons/fa";
// // import { IoIosWater } from "react-icons/io";
// import About from "./Background";
// import Profile from "./Profile";
// import AvatarPick from "./AvatarPick";
// // import NFTGallery from "./NftMarket";
// import logo from "../../assets/conversia-lg.png";
// import ResponsiveHeader from "./ResponsiveHeader";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import AnimationPicker from "./AnimationPicker";

// type HeaderProps = {
//   setModelUrl: (url: string) => void;
//   setBackgroundUrl: (url: string) => void;
//   setModelId: (id: number) => void;
//   userId: number;
// };

// const Header: React.FC<HeaderProps> = ({
//   setModelUrl,
//   setBackgroundUrl,
//   setModelId,
//   userId,
// }) => {
//   const [accountId, setAccountId] = useState<string | null>(null);
//   const [showProfile, setShowProfile] = useState(false);
//   const [showBackground, setShowBackground] = useState(false);
//   const [showAvatar, setShowAvatar] = useState(false);
//   const [showAnimationPopup, setShowAnimationPopup] = useState(false);
//   // const [showNft, setShowNft] = useState(false);
//   const navigate = useNavigate();
//   // const network: "mainnet" | "testnet" = "testnet"; // adjust if using testnet

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       navigate("/landing");
//     } else {
//       try {
//         const decoded = JSON.parse(atob(token.split(".")[1]));
//         if (decoded.accountId) {
//           setAccountId(decoded.accountId); // Just show something
//         } else {
//           navigate("/landing");
//         }
//       } catch (err) {
//         console.error("Failed to decode JWT", err);
//         navigate("/landing");
//       }
//     }
//   }, [navigate]);

//   const handleDisconnect = () => {
//     localStorage.removeItem("jwt");
//     localStorage.removeItem("userId");
//     window.location.href = "/landing";
//   };

//   return (
//     <>
//       {/* Desktop Navbar */}
//       <div className="hidden md:flex fixed top-6 left-4 right-4 z-50 items-center justify-between">
//         {/* Logo */}
//         <Link to="/chat">
//           <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full shadow-md px-4 py-2 cursor-pointer hover:bg-white/20 transition">
//             <img
//               src={logo}
//               alt="Conversia Logo"
//               className="h-10 w-auto object-contain"
//             />
//           </div>
//         </Link>

//         {/* Menu */}
//         <div className="flex gap-8 text-white text-xl font-semibold bg-white/10 backdrop-blur-xl rounded-full shadow-lg px-8 py-4">
//           <button
//             onClick={() => setShowProfile(true)}
//             className="flex items-center gap-2 hover:opacity-80"
//           >
//             <FaBook className="text-teal-400 text-2xl" />
//             Profile
//           </button>
//           <button
//             onClick={() => setShowBackground(true)}
//             className="flex items-center gap-2 hover:opacity-80"
//           >
//             <FaImages className="text-red-400 text-2xl" />
//             Background
//           </button>
//           <button
//             onClick={() => setShowAvatar(true)}
//             className="flex items-center gap-2 hover:opacity-80"
//           >
//             <FaUser className="text-yellow-400 text-2xl" />
//             Avatar
//           </button>
//           <button
//             onClick={() => setShowAnimationPopup(true)}
//             className="flex items-center gap-2 hover:opacity-80"
//           >
//             <FaImages className="text-blue-400 text-2xl" />
//             Animation
//           </button>
//           {/* <button
//             onClick={() => setShowNft(true)}
//             className="flex items-center gap-2 hover:opacity-80"
//           >
//             <IoIosWater className="text-blue-200 text-2xl" />
//             Your NFT
//           </button> */}
//         </div>

//         {/* Disconnect Button */}

//         {accountId && (
//           <button
//             onClick={handleDisconnect}
//             className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow-lg transition"
//           >
//             Disconnect ({accountId.slice(0, 6)}...)
//           </button>
//         )}
//       </div>

//       {/* Mobile Nav */}
//       <div className="block md:hidden">
//         <ResponsiveHeader
//           setModelUrl={setModelUrl}
//           setModelId={setModelId}
//           setBackgroundUrl={setBackgroundUrl}
//           userId={userId}
//           setShowAvatar={setShowAvatar}
//           setShowBackground={setShowBackground}
//           setShowProfile={setShowProfile}
//           // setShowNft={setShowNft}
//         />
//       </div>

//       {/* Popups */}
//       {showProfile && <Profile onClose={() => setShowProfile(false)} />}
//       {showBackground && (
//         <About
//           onClose={() => setShowBackground(false)}
//           onSelectBackground={(url) => setBackgroundUrl(url)}
//         />
//       )}
//       {showAvatar && (
//         <AvatarPick
//           onClose={() => setShowAvatar(false)}
//           onSelectAvatar={(modelUrl, modelId) => {
//             setModelUrl(modelUrl);
//             setModelId(modelId);
//           }}
//         />
//       )}
//       {showAnimationPopup && (
//         <AnimationPicker
//           onClose={() => setShowAnimationPopup(false)} // Close the popup
//           onSelectAnimation={() => {
//             setShowAnimationPopup(false); // Close the popup after selection
//           }}
//         />
//       )}
//       {/* {showNft && (
//         <NFTGallery
//           onClose={() => setShowNft(false)}
//           walletAddress={metamaskAccount || ""}
//           network={network}
//         />
//       )} */}
//     </>
//   );
// };

// export default Header;


import React, { useState, useEffect } from "react";
import { FaUser, FaBook, FaImages } from "react-icons/fa";
import About from "./Background";
import Profile from "./Profile";
import AvatarPick from "./AvatarPick";
import logo from "../../assets/conversia-lg.png";
import ResponsiveHeader from "./ResponsiveHeader";
import { useNavigate, Link } from "react-router-dom";
// import AnimationPicker from "./AnimationPicker";

interface HeaderProps {
  setModelUrl: (url: string) => void;
  setBackgroundUrl: (url: string) => void;
  setModelId: (id: number) => void;
  userId: number;
  setCurrentAnimation: (animation: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  setModelUrl,
  setBackgroundUrl,
  setModelId,
  userId,
  // setCurrentAnimation,
}) => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  // const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/landing");
    } else {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.accountId) {
          setAccountId(decoded.accountId);
        } else {
          navigate("/landing");
        }
      } catch (err) {
        console.error("Failed to decode JWT", err);
        navigate("/landing");
      }
    }
  }, [navigate]);

  const handleDisconnect = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "/landing";
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:flex fixed top-6 left-4 right-4 z-50 items-center justify-between">
        {/* Logo */}
        <Link to="/chat">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full shadow-md px-4 py-2 cursor-pointer hover:bg-white/20 transition">
            <img
              src={logo}
              alt="Conversia Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Menu */}
        <div className="flex gap-8 text-white text-xl font-semibold bg-white/10 backdrop-blur-xl rounded-full shadow-lg px-8 py-4">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <FaBook className="text-teal-400 text-2xl" />
            Profile
          </button>
          <button
            onClick={() => setShowBackground(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <FaImages className="text-red-400 text-2xl" />
            Background
          </button>
          <button
            onClick={() => setShowAvatar(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <FaUser className="text-yellow-400 text-2xl" />
            Avatar
          </button>
          {/* <button
            onClick={() => setShowAnimationPopup(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <FaPlay className="text-blue-400 text-2xl" />
            Animation
          </button> */}
        </div>

        {accountId && (
          <button
            onClick={handleDisconnect}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow-lg transition"
          >
            Disconnect ({accountId.slice(0, 6)}...)
          </button>
        )}
      </div>

      {/* Mobile Nav */}
      <div className="block md:hidden">
        <ResponsiveHeader
          setModelUrl={setModelUrl}
          setModelId={setModelId}
          setBackgroundUrl={setBackgroundUrl}
          userId={userId}
          setShowAvatar={setShowAvatar}
          setShowBackground={setShowBackground}
          setShowProfile={setShowProfile}
        />
      </div>

      {/* Popups */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showBackground && (
        <About
          onClose={() => setShowBackground(false)}
          onSelectBackground={(url) => setBackgroundUrl(url)}
        />
      )}
      {showAvatar && (
        <AvatarPick
          onClose={() => setShowAvatar(false)}
          onSelectAvatar={(modelUrl, modelId) => {
            setModelUrl(modelUrl);
            setModelId(modelId);
          }}
        />
      )}
      {/* {showAnimationPopup && (
        <AnimationPicker
          onClose={() => setShowAnimationPopup(false)}
          onSelectAnimation={(animation) => {
            setCurrentAnimation(animation);
            setShowAnimationPopup(false);
          }}
        />
      )} */}
    </>
  );
};

export default Header;
