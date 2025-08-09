import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/streamverse/ui/button";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/streamverse/ui/showmore";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/streamverse/ui/avatar";
import { Eye, Clock, Play } from "lucide-react";
import Place1 from "@/assets/place1.webp";
import Place2 from "@/assets/place2.jpg";
import Place3 from "@/assets/place3.jpg";
import Place4 from "@/assets/place4.jpg";
import MainLayout from "@/pages/streamverse/layouts/MainLayout";

const videos = [
  {
    title: "Epic Gaming Marathon Stream",
    thumbnail: Place1,
    author: "ProGamer_Alex",
    views: "1M views",
    time: "1 week ago",
    category: "Gaming",
    avatar: "null",
    duration: "2:45:30",
    isLive: false,
  },
  {
    title: "Cooking with Chef Maria",
    thumbnail: Place2,
    author: "ChefMaria",
    views: "500K views",
    time: "2 days ago",
    category: "Cooking",
    avatar: "null",
    duration: "1:23:15",
    isLive: true,
  },
  {
    title: "Late Night Talk Show",
    thumbnail: Place3,
    author: "TalkShow_Host",
    views: "800K views",
    time: "3 days ago",
    category: "Talk Show",
    avatar: "null",
    duration: "3:12:45",
    isLive: false,
  },
  {
    title: "Music Production Masterclass",
    thumbnail: Place4,
    author: "MusicProducer_Sam",
    views: "900K views",
    time: "5 days ago",
    category: "Music",
    avatar: "null",
    duration: "4:05:20",
    isLive: false,
  },
  {
    title: "Valorant Tournament Finals",
    thumbnail: Place1,
    author: "EsportsArena",
    views: "1.2M views",
    time: "1 day ago",
    category: "Gaming",
    avatar: "null",
    duration: "5:30:12",
    isLive: false,
  },
  {
    title: "Baking Basics for Beginners",
    thumbnail: Place2,
    author: "BakeWithSarah",
    views: "300K views",
    time: "6 days ago",
    category: "Cooking",
    avatar: "null",
    duration: "45:30",
    isLive: true,
  },
  {
    title: "Celebrity Interview Special",
    thumbnail: Place3,
    author: "StarTalk_Official",
    views: "900K views",
    time: "1 week ago",
    category: "Talk Show",
    avatar: "null",
    duration: "2:15:45",
    isLive: false,
  },
  {
    title: "Jazz Guitar Improvisation",
    thumbnail: Place4,
    author: "JazzMaster_Joe",
    views: "700K views",
    time: "2 days ago",
    category: "Music",
    avatar: "null",
    duration: "1:42:20",
    isLive: false,
  },
  // Add more videos with similar structure...
  {
    title: "Minecraft Building Competition",
    thumbnail: Place1,
    author: "MinecraftPro",
    views: "850K views",
    time: "4 days ago",
    category: "Gaming",
    avatar: "null",
    duration: "3:20:15",
    isLive: false,
  },
  {
    title: "Italian Pasta Making",
    thumbnail: Place2,
    author: "ItalianNonna",
    views: "600K views",
    time: "3 days ago",
    category: "Cooking",
    avatar: "null",
    duration: "1:15:30",
    isLive: false,
  },
  {
    title: "Comedy Night Special",
    thumbnail: Place3,
    author: "ComedyClub",
    views: "1.1M views",
    time: "5 days ago",
    category: "Talk Show",
    avatar: "null",
    duration: "2:30:45",
    isLive: false,
  },
  {
    title: "Electronic Music Live Set",
    thumbnail: Place4,
    author: "DJ_Nexus",
    views: "750K views",
    time: "1 week ago",
    category: "Music",
    avatar: "null",
    duration: "2:05:30",
    isLive: true,
  },
];

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const initialVisibleCount = 4;
  const [visibleCounts, setVisibleCounts] = useState<{ [key: string]: number }>(
    {
      Gaming: initialVisibleCount,
      Cooking: initialVisibleCount,
      "Talk Show": initialVisibleCount,
      Music: initialVisibleCount,
    }
  );

  const handleShowMore = (category: string) => {
    setVisibleCounts((prevCounts) => ({
      ...prevCounts,
      [category]: prevCounts[category] + initialVisibleCount,
    }));
  };

  const handleShowLess = (category: string) => {
    setVisibleCounts((prevCounts) => ({
      ...prevCounts,
      [category]: initialVisibleCount,
    }));
  };

  const categories = ["Gaming", "Cooking", "Talk Show", "Music"];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm border-b">
          <div className="container mx-auto px-6 lg:px-12 py-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Browse by <span className="text-white">Categories</span>
              </h1>
              <p className="text-white text-lg max-w-2xl mx-auto">
                Discover amazing content across different categories and find
                your next favorite stream
              </p>
            </div>
          </div>
        </section>

        {/* Categories Content */}
        <div className="container mx-auto px-6 lg:px-12 py-12">
          {categories.map((category) => {
            const filteredVideos = videos.filter(
              (video) => video.category === category
            );
            const visibleVideos = filteredVideos.slice(
              0,
              visibleCounts[category]
            );
            const isExpanded = visibleCounts[category] > initialVisibleCount;
            const hasMoreContent =
              filteredVideos.length > visibleCounts[category];

            return (
              <div key={category} className="mb-16">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {category}
                    </h2>
                    <p className="text-gray-600">
                      {filteredVideos.length} videos available
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                    onClick={() =>
                      navigate(`${category.toLowerCase().replace(/\s+/g, "-")}`)
                    }
                  >
                    View All in {category}
                  </Button>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleVideos.map((video, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-48 object-cover"
                        />

                        {/* Live Badge */}
                        {video.isLive && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                          </div>
                        )}

                        {/* Duration */}
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                          {video.duration}
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {video.title}
                        </h3>

                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={video.avatar}
                              alt={video.author}
                            />
                            <AvatarFallback className="bg-purple-500 text-white text-sm">
                              {video.author.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-gray-700 font-medium text-sm">
                              {video.author}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {video.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {video.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More/Less Button */}
                {filteredVideos.length > initialVisibleCount && (
                  <div className="mt-8 flex items-center justify-center">
                    <div className="flex items-center w-full max-w-md">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <div className="mx-4">
                        {hasMoreContent ? (
                          <Button
                            onClick={() => handleShowMore(category)}
                            variant="outline"
                            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                            Show More
                          </Button>
                        ) : isExpanded ? (
                          <Button
                            onClick={() => handleShowLess(category)}
                            variant="outline"
                            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                            Show Less
                          </Button>
                        ) : null}
                      </div>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Categories;
