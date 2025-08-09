import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/streamverse/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/streamverse/ui/button";
import Place1 from "@/assets/place1.webp";
import Place2 from "@/assets/place2.jpg";
import Place3 from "@/assets/place3.jpg";
import Place4 from "@/assets/place4.jpg";
import MainLayout from "../layouts/MainLayout";
import LiveVideoCard from "../../../components/streamverse/LiveVideoCard";
import "../layouts/page.css";
import { BASE_URL } from "../../../config/constants";
import { useEffect, useState } from "react";
import axios from "axios";
import { Stream, StreamResponse } from "../../../types/StreamsType";
import { Play, Users, Eye } from "lucide-react";
import Intro from "../../../components/Intro";

const featuredStreams = [
  {
    id: 1,
    image: Place1,
    category: "Gaming",
    title: "James Dillon",
    description: "1 on 1 Death Match Valorant Tournament",
    streamer: "James Dillon Gaming",
    avatar: "null",
    viewers: "12.5K",
    isLive: true,
    route: "/stream/wongsodillon",
  },
  {
    id: 2,
    image: Place2,
    category: "Gaming",
    title: "Sarah Chen",
    description: "Apex Legends Ranked Championship",
    streamer: "SarahGaming",
    avatar: "null",
    viewers: "8.2K",
    isLive: true,
    route: "/stream/sarahchen",
  },
  {
    id: 3,
    image: Place3,
    category: "Gaming",
    title: "Alex Storm",
    description: "Fortnite Creative Building Tutorial",
    streamer: "StormGaming",
    avatar: "null",
    viewers: "5.8K",
    isLive: true,
    route: "/stream/alexstorm",
  },
  {
    id: 4,
    image: Place4,
    category: "Gaming",
    title: "Mike Johnson",
    description: "Call of Duty Warzone Squad Up",
    streamer: "MikeJ Gaming",
    avatar: "null",
    viewers: "15.3K",
    isLive: true,
    route: "/stream/mikejohnson",
  },
];

const Home: React.FC = () => {
  // Initialize as empty array instead of null
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.get<StreamResponse>(
          `${BASE_URL}/api/streamverse/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Fetched streams:", response.data);

        // Handle the actual API response structure
        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.streams)
        ) {
          setStreams(response.data.streams);
        } else if (Array.isArray(response.data)) {
          // Fallback for direct array response
          setStreams(response.data);
        } else {
          console.warn("API response has unexpected structure:", response.data);
          setStreams([]);
          setError("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching streams:", error);
        setStreams([]);
        setError("Failed to load streams");
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, []);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const currentStream = featuredStreams[currentIndex];

  return (
    <MainLayout>
      <Intro title={"Streamverse"} color={"pink"} />
      <section className="relative h-[80vh] min-h-[460px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={currentStream.image}
            alt={currentStream.title}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-semibold">LIVE</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Eye size={16} />
                  <span className="text-sm font-medium">
                    {currentStream.viewers} viewers
                  </span>
                </div>
              </div>

              <div className="text-purple-400 font-semibold text-sm tracking-wider uppercase mb-2">
                {currentStream.category}
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {currentStream.title}
              </h1>

              <p className="text-white/90 text-lg lg:text-xl mb-6 leading-relaxed">
                {currentStream.description}
              </p>

              <div className="flex items-center gap-4 mb-8">
                <Avatar className="w-16 h-16 ring-4 ring-white/20">
                  <AvatarImage src={currentStream.avatar} />
                  <AvatarFallback className="bg-purple-500 text-white">
                    {currentStream.streamer.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-semibold text-lg">
                    {currentStream.streamer}
                  </div>
                  <div className="text-white/70 text-sm">Streaming now</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  onClick={() => navigate(currentStream.route)}
                >
                  <Play size={20} className="mr-2" />
                  Watch Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <Users size={20} className="mr-2" />
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20">
          <div className="flex flex-col gap-3 bg-black/20 backdrop-blur-sm rounded-2xl p-2">
            {featuredStreams.map((stream, index) => (
              <button
                key={stream.id}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 ${
                  currentIndex === index
                    ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-black/20 scale-110"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={stream.image}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
                {currentIndex === index && (
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent" />
                )}
                {currentIndex === index && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full shadow-lg animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              <span className="text-purple-600">Streams</span> you might like
            </h2>
            <Button
              variant="outline"
              className="hover:bg-purple-50 hover:text-purple-600"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-video mb-4" />
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded w-3/4" />
                    <div className="bg-gray-200 h-3 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-500 text-lg mb-2">{error}</div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  Try Again
                </Button>
              </div>
            ) : streams.length > 0 ? (
              streams.map((stream) => (
                <LiveVideoCard key={stream.id} stream={stream} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">
                  No streams available
                </div>
                <p className="text-gray-400 mt-2">
                  Check back later for new content
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
