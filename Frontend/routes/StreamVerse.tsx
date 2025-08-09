import React from "react";
import { Routes, Route } from "react-router-dom";

// stream home
import Home from "../src/pages/streamverse/pages/Home";
import Categories from "../src/pages/streamverse/pages/Categories";
import ViewAllCategory from "../src/pages/streamverse/pages/ViewAllCategory";

// // streaming
import Streaming from "../src/pages/streamverse/pages/Streaming/Streaming";

// // account
import MyChannel from "../src/pages/streamverse/pages/Streaming/MyChannel";
import Account from "../src/pages/streamverse/pages/Account/Account";
import SearchPage from "../src/pages/streamverse/pages/Search/SearchPage";

import { UserProvider } from "../src/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";

const StreamVerse: React.FC = () => {
  return (
    <ToastProvider>
      <UserProvider>
        <Routes>
          {/* Main Home Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:category" element={<ViewAllCategory />} />

          <Route path=":topic_id" element={<Streaming />} /> 

          <Route path="/account" element={<Account />} /> 
          <Route path="/my-channel" element={<MyChannel />} />
          <Route path="search/:search?" element={<SearchPage />} />
        </Routes>
      </UserProvider>
    </ToastProvider>

  );
};

export default StreamVerse;
