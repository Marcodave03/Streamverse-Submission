import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  LogOut,
  ArrowRight,
  Clock,
  Sparkles,
  Play,
  Users,
  GraduationCap,
  Heart,
} from "lucide-react";
import conversiaImg from "../assets/mode1.png";
import streamImg from "../assets/mode2.png";
import eduImg from "../assets/mode3.png";
import toyImg from "../assets/mode4.png";

type JwtPayload = {
  id: number;
  accountId: string;
  iat: number;
  exp: number;
};

const Selector = () => {
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
      setAccountId(decoded.accountId);
      console.log("Decoded JWT:", decoded);
    } catch (err) {
      console.error("JWT decode failed", err);
    }
  }, []);

  useEffect(() => {
    sessionStorage.removeItem("hasSeenConversiaIntro");
    sessionStorage.removeItem("hasSeenStreamverseIntro");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAccountId(null);
    navigate("/landing");
  };

  const cards = [
    {
      title: "Conversia",
      description:
        "Chat with expressive 3D AI avatars in real-time conversations",
      image: conversiaImg,
      onClick: () => navigate("/chat/conversia"),
      gradient: "from-blue-500 to-cyan-500",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "Most Popular",
      badgeColor: "bg-blue-500",
    },
    {
      title: "Streamverse",
      description:
        "Watch and react together in synchronized streaming rooms with 3D avatars",
      image: streamImg,
      onClick: () => navigate("/chat/stream"),
      gradient: "from-purple-500 to-pink-500",
      icon: <Play className="w-5 h-5" />,
      badge: "Live Now",
      badgeColor: "bg-pink-600",
    },
    // {
    //   title: "EduFun",
    //   description:
    //     "Learn together with intelligent AI tutors and study companions",
    //   image: eduImg,
    //   comingSoon: true,
    //   //from-indigo-500 to-purple-500
    //   gradient: "from-purple-500 to-pink-500",
    //   icon: <GraduationCap className="w-5 h-5" />,
    //   badge: "Coming Soon",
    //   badgeColor: "bg-black",
    // },

    {
      title: "EduFun",
      description: "Learn together with intelligent AI tutors and study companions",
      image: eduImg,
      onClick: () => navigate("/chat/edufun"), // <-- adjust route if needed
      gradient: "from-indigo-500 to-purple-500",
      icon: <GraduationCap className="w-5 h-5" />,
      badge: "Study Now",
      badgeColor: "bg-green-500",
    },
    {
      title: "FunToy",
      description: "Physical companion dolls enhanced with voice AI technology",
      image: toyImg,
      comingSoon: true,
      gradient: "from-pink-500 to-rose-500",
      icon: <Heart className="w-5 h-5" />,
      badge: "Coming Soon",
      badgeColor: "bg-black",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <header className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                CONVERSIA
              </span>
            </div>

            {accountId && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30 shadow-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-slate-700 font-medium text-sm">
                    {accountId.length > 13
                      ? accountId.slice(0, 6) + "..." + accountId.slice(-4)
                      : accountId}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="group p-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-red-50/80 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <LogOut className="w-5 h-5 text-slate-600 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 text-indigo-700 text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Choose Your Experience
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Select Your
              </span>
              <br />
              <span className="text-slate-800">Mode</span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Choose how you'd like to interact with our AI-powered ecosystem
            </p>
          </div>

          {/* Enhanced Cards Grid */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {cards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => !card.comingSoon && card.onClick?.()}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative bg-white/60 backdrop-blur-sm border border-white/30 rounded-3xl shadow-xl p-8 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 ${
                  card.comingSoon
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:-translate-y-2 hover:scale-105 hover:bg-white/80"
                } ${hoveredCard === idx ? "ring-2 ring-indigo-500/30" : ""}`}
              >
                {/* Background Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}
                />

                {/* Badge */}
                <div
                  className={`absolute -top-3 -right-3 ${card.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg`}
                >
                  {card.badge}
                </div>

                {/* Image Container */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative">
                    <img
                      src={card.image || "/placeholder.svg"}
                      alt={card.title}
                      className="w-32 h-32 rounded-3xl border-4 border-white/50 shadow-xl object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Glow effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-opacity duration-500`}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-3">
                    <div
                      className={`p-2 bg-gradient-to-r ${card.gradient} rounded-xl text-white shadow-lg mr-2`}
                    >
                      {card.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {card.title}
                    </h2>
                  </div>

                  <p className="text-slate-600 text-center mb-4 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Action Button */}
                  {!card.comingSoon ? (
                    <div className="flex justify-center">
                      <button className="group/btn flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        Launch
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="flex items-center px-4 py-2 bg-slate-200 text-slate-500 rounded-xl font-medium text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Coming Soon
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Arrow */}
                {!card.comingSoon && (
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-5 h-5 text-indigo-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Powered by Hedera Hashgraph • Built with ❤️ for the future of AI
              interaction
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Selector;
