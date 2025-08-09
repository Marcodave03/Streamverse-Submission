import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ConversiaPage from "./pages/ConversiaPage";
import ChatModeSelector from "./pages/Selector";
import StreamversePage from "./pages/StreamversePage";
import ToyPage from "./pages/ToyPage";
import EduFunPage from "./pages/EduFunPage";
import NotFoundPage from "./components/NotFoundComponent";
import { Analytics } from "@vercel/analytics/react"

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen">
      <Router>
        <Routes>
          <Route path="/chat" element={<Outlet />}>
            <Route index element={<ChatModeSelector />} />
            <Route
              path="conversia"
              element={<ConversiaPage interview_prompt="..." />}
            />
            <Route path="stream/*" element={<StreamversePage />} />
            <Route path="edufun/*" element={<EduFunPage />} />
            <Route path="toy" element={<ToyPage />} />
          </Route>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <Analytics />
    </div>
  );
};

export default App;
