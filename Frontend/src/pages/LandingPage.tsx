import { useState, useEffect } from "react";
import {
  MessageCircle,
  Shield,
  Globe,
  Sparkles,
  Twitter,
  PartyPopper,
  Users,
  Zap,
  ArrowRight,
  Star,
  Play,
  ChevronDown,
} from "lucide-react";
const testUsers = [
  {
    name: "Test User 1",
    accountId: "0.0.6300744",
    privateKey:
      "3030020100300706052b8104000a04220420911bdc975795fbf74fed781b5bd5bb2cb7dded15cf875b6fce84e3de830d65d9",
    publicKey:
      "302d300706052b8104000a032200038f752e2d4338e769a8e6ffff9cb2d1221eabfb7d639db7a3d46ad882c8f617d9",
  },
  {
    name: "Test User 2",
    accountId: "0.0.4668520",
    privateKey:
      "3030020100300706052b8104000a04220420bcd97038b12bfebe3eb498a73a0579222d11d705c0faffcc1320b20012866e52",
    publicKey:
      "302d300706052b8104000a0322000356e89d5c3987f3f448c93a7a0da8700b8c216a674740fcdaac63627b4131746b",
  },
  {
    name: "Test User 3",
    accountId: "0.0.6416612",
    privateKey:
       "3030020100300706052b8104000a04220420ed5f7ec41c3f758bb7f1ae946fffe5d3cd51c1afb78a41b9e2d849ababef9c57",
    publicKey:
      "302d300706052b8104000a032200029f560fdc486063550fad60ed690c5263d5854fc5ecae09e15d80b648c7d8d247",
  },
];

const ConversiaLanding = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const host = import.meta.env.VITE_HOST;

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleEnterConversia = async () => {
    try {
      const hederaData = {
        accountId: import.meta.env.VITE_ACCOUNT_ID,
        publicKey: import.meta.env.VITE_DER_ENCODED_PUBLIC_KEY,
        privateKey: import.meta.env.VITE_DER_ENCODED_PRIVATE_KEY,
      };
      console.log(hederaData.accountId, hederaData.publicKey);
      const response = await fetch(
        `${host}/api/account/create-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: hederaData.accountId,
            publicKey: hederaData.publicKey,
            privateKey: hederaData.privateKey,
          }),
        }
      );
      console.log(response);
      const data = await response.json();
      if (data.success) {
        console.log("Login successful:", data);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            id: data.user.id,
            accountId: data.user.accountId,
            username: data.user.username,
            created_at: data.user.created_at,
            isNewUser: data.isNewUser,
          })
        );
        window.location.href = "/chat";
      } else {
        console.error("Login failed:", data.message);
        alert("Login failed: " + data.message);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleTestLogin = async (hederaData: {
    accountId: string;
    publicKey: string;
    privateKey: string;
  }) => {
    try {
      console.log("Logging in:", hederaData.accountId, hederaData.publicKey);
      const response = await fetch(
        `${host}/api/account/create-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hederaData),
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log("✅ Login successful:", data);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            id: data.user.id,
            accountId: data.user.accountId,
            username: data.user.username,
            created_at: data.user.created_at,
            isNewUser: data.isNewUser,
          })
        );
        window.location.href = "/chat";
      } else {
        console.error("❌ Login failed:", data.message);
        alert("Login failed: " + data.message);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Network error. Please try again.");
    }
  };

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "3D Avatar Conversations",
      description:
        "Engage with lifelike 3D avatars that respond with emotions, voice, and facial expressions",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Hedera Auth",
      description:
        "Login handled automatically via secure backend credentials, no wallet needed",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Real-Time Streaming",
      description:
        "Connect with AI avatars and stream immersive scenes in real time",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI NFT Ownership",
      description:
        "Own, trade, and customize your avatars as NFTs in the Hedera ecosystem",
      gradient: "from-purple-500 to-indigo-500",
    },
  ];

  const stats = [
    {
      number: "$112",
      label: "AI Avatar",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      number: "100%",
      label: "Decentralized",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      number: "3D",
      label: "Immersive Experience",
      icon: <Globe className="w-6 h-6" />,
    },
    { number: "∞", label: "Possibilities", icon: <Star className="w-6 h-6" /> },
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Digital Artist",
      content:
        "The 3D avatars are incredibly lifelike. It's like talking to a real person!",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      role: "Tech Enthusiast",
      content:
        "Hedera integration makes everything so smooth and secure. Love it!",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "NFT Collector",
      content:
        "Finally, AI avatars I can actually own and trade. Revolutionary!",
      rating: 5,
    },
  ];



  // const handleHashPackConnect = async () => {
  //   try {
  //     // Check if HashConnect is available
  //     if (!window.hashconnect) {
  //       alert("HashPack not found. Make sure it's installed.");
  //       return;
  //     }

  //     const accounts = await window.hashconnect.connect();
  //     const accountId = accounts[0];

  //     if (!accountId) {
  //       alert("No account selected from HashPack.");
  //       return;
  //     }

  //     console.log("Connected via HashPack:", accountId);

  //     const response = await fetch("http://localhost:5555/api/account/create-account", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ accountId }),
  //     });

  //     const data = await response.json();
  //     if (data.success) {
  //       localStorage.setItem("authToken", data.token);
  //       localStorage.setItem(
  //         "userInfo",
  //         JSON.stringify({
  //           id: data.user.id,
  //           accountId: data.user.accountId,
  //           username: data.user.username,
  //           created_at: data.user.created_at,
  //           isNewUser: data.isNewUser,
  //         })
  //       );
  //       window.location.href = "/chat";
  //     } else {
  //       alert("Login failed: " + data.message);
  //     }
  //   } catch (error) {
  //     console.error("❌ HashPack connection failed:", error);
  //     alert("HashPack connection failed. See console for details.");
  //   }
  // };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{
            transform: `translate(-50%, -50%) translateY(${scrollY * 0.05}px)`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <header className="container mx-auto px-6 py-6 backdrop-blur-sm bg-white/10 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                CONVERSIA
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              {["Features", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative text-slate-700 hover:text-indigo-600 transition-colors duration-300 group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* Enhanced Hero Section */}
        <section
          className={`container mx-auto px-6 py-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 text-indigo-700 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Hedera Hashgraph
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI-Powered 3D
              </span>
              <br />
              <span className="text-slate-800">Conversational Bot</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Experience the future of digital interaction with lifelike 3D
              avatars powered by secure Hedera login and cutting-edge AI
              technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {testUsers.map((user, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTestLogin(user)}
                  className={`group relative px-8 py-4 bg-gradient-to-r ${
                    idx === 0
                      ? "from-indigo-600 to-blue-600"
                      : idx === 1
                      ? "from-red-600 to-orange-600"
                      : "from-green-600 to-lime-500"
                  } text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
                >
                  <span className="flex items-center">
                    🚀 {user.name}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ))}
              {/* <button
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={handleHashPackConnect}
              >
                <span className="flex items-center">
                  🔐 Connect with HashPack
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button> */}
              <button
                className="group flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-2xl font-semibold text-lg border border-white/50 hover:bg-white/90 transition-all duration-300"
                onClick={() =>
                  window.open("https://youtu.be/FSyzHub6LC4", "_blank")
                }
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-16">
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Conversia?
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Conversia brings AI avatars to life with real ownership, secure
              access, and immersive interaction that feels genuinely human.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl backdrop-blur-sm transition-all duration-500 cursor-pointer overflow-hidden ${
                  currentFeature === index
                    ? "bg-white/80 border-2 border-indigo-500/30 scale-105 shadow-2xl shadow-indigo-500/20"
                    : "bg-white/40 border border-white/30 hover:bg-white/60 hover:scale-102"
                }`}
                onMouseEnter={() => setCurrentFeature(index)}
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <div
                  className={`relative mb-6 p-4 rounded-2xl w-fit transition-all duration-300 ${
                    currentFeature === index
                      ? `bg-gradient-to-r ${feature.gradient} text-white shadow-lg`
                      : "bg-white/50 text-slate-700 group-hover:bg-white/80"
                  }`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-4 text-slate-800">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Technology Stack */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-3xl p-12 border border-white/50 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
                Powered by Cutting-Edge Technology
              </h2>
              <p className="text-xl text-slate-600">
                Built on Hedera Hashgraph for ultimate security and ownership
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Hedera Hashgraph",
                  description:
                    "Secure, established hashgraph infrastructure for true digital ownership and NFT trading",
                  gradient: "from-indigo-500 to-blue-600",
                },
                {
                  icon: <Zap className="w-8 h-8" />,
                  title: "Secure Authentication",
                  description:
                    "Privacy-preserving authentication that keeps your identity secure",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: <Globe className="w-8 h-8" />,
                  title: "3D AI Avatars",
                  description:
                    "Emotionally intelligent avatars with realistic expressions and voice",
                  gradient: "from-cyan-500 to-indigo-500",
                },
              ].map((tech, index) => (
                <div
                  key={index}
                  className="group text-center p-6 rounded-2xl hover:bg-white/50 transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${tech.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="text-white">{tech.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-800">
                    {tech.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
              What Our{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Users Say
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 hover:bg-white/80 transition-all duration-300 hover:scale-105"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-slate-800">
                    {testimonial.name}
                  </p>
                  <p className="text-slate-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Vision Section */}
        <section id="about" className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-slate-800">
                Our{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Vision
                </span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                To revolutionize digital communication by creating AI companions
                that feel genuinely alive. We're building a future where your
                digital interactions are as meaningful as real-world
                conversations.
              </p>
              <div className="space-y-6">
                {[
                  "True digital ownership through NFTs",
                  "Emotionally intelligent AI interactions",
                  "Seamless Hedera Hashgraph integration",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" />
                    <span className="text-slate-700 text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/50 shadow-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-slate-800">
                    5000+
                  </h3>
                  <p className="text-slate-600">Expected Users by 2025</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-3xl p-16 border border-white/50 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-slate-800">
              Ready to Meet Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                AI Companion?
              </span>
            </h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
              Join the future of digital interaction. Experience the magic of 3D
              AI avatars powered by Hedera Hashgraph.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleEnterConversia}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center">
                  🚀 Enter Conversia
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer
          id="contact"
          className="container mx-auto px-6 py-12 border-t border-white/20"
        >
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                CONVERSIA
              </span>
            </div>
            <p className="text-slate-600 mb-8">
              Building the future of AI interaction, one conversation at a time.
            </p>
            <div className="flex justify-center space-x-8">
              <a
                href="https://x.com/Conversia__"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors duration-300"
              >
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Follow our X</span>
              </a>
              <a
                href="https://discord.gg/EyvSgsPv"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors duration-300"
              >
                <PartyPopper className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Join Discord</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ConversiaLanding;
