import React from "react";
import { Routes, Route } from "react-router-dom";
import EduPage from "../src/pages/edufun/EduPage";
import LessonPage from "../src/pages/edufun/Lesson/LessonPage";
import NotFoundPage from "../src/components/NotFoundComponent";
import { UserProvider } from "../src/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";

const Edufun: React.FC = () => {
  return (
    <ToastProvider>
      <UserProvider>
        <Routes>
          {/* Main Home Routes */}
          <Route path="/" element={<EduPage />} /> 
           <Route path="lesson/:id" element={<LessonPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </ToastProvider>

  );
};

export default Edufun;
