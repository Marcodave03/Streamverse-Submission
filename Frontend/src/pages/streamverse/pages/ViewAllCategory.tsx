import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/streamverse/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/streamverse/ui/avatar";
import {
  Eye,
  Clock,
  Play,
  Search,
  Grid3X3,
  List,
  Users,
  ArrowLeft,
} from "lucide-react";
import Place1 from "@/assets/place1.webp";
import Place2 from "@/assets/place2.jpg";
import Place3 from "@/assets/place3.jpg";
import Place4 from "@/assets/place4.jpg";
import MainLayout from "@/pages/streamverse/layouts/MainLayout";

// Extended video data with more properties for filtering/sorting
const allVideos = [
  {
    id: 1,
    title: "Epic Gaming Marathon Stream",
    thumbnail: Place1,
    author: "ProGamer_Alex",
    views: "1.2M views",
    viewCount: 1200000,
    time: "1 week ago",
    uploadDate: "2024-01-07",
    category: "Gaming",
    avatar: "null",
    duration: "2:45:30",
    isLive: false,
    subscribers: "245K",
    tags: ["Action", "Multiplayer", "Tournament"],
  },
  {
    id: 2,
    title: "Valorant Pro Tournament Finals",
    thumbnail: Place2,
    author: "EsportsArena",
    views: "2.1M views",
    viewCount: 2100000,
    time: "3 days ago",
    uploadDate: "2024-01-11",
    category: "Gaming",
    avatar: "null",
    duration: "5:30:12",
    isLive: true,
    subscribers: "1.2M",
    tags: ["Esports", "Tournament", "Professional"],
  },
  {
    id: 3,
    title: "Minecraft Building Competition",
    thumbnail: Place3,
    author: "MinecraftPro",
    views: "850K views",
    viewCount: 850000,
    time: "4 days ago",
    uploadDate: "2024-01-10",
    category: "Gaming",
    avatar: "null",
    duration: "3:20:15",
    isLive: false,
    subscribers: "890K",
    tags: ["Creative", "Building", "Community"],
  },
  {
    id: 4,
    title: "Call of Duty Warzone Squad",
    thumbnail: Place4,
    author: "TacticalGamer",
    views: "950K views",
    viewCount: 950000,
    time: "2 days ago",
    uploadDate: "2024-01-12",
    category: "Gaming",
    avatar: "null",
    duration: "4:15:30",
    isLive: false,
    subscribers: "670K",
    tags: ["FPS", "Battle Royale", "Squad"],
  },
  {
    id: 5,
    title: "Cooking with Chef Maria",
    thumbnail: Place1,
    author: "ChefMaria",
    views: "500K views",
    viewCount: 500000,
    time: "2 days ago",
    uploadDate: "2024-01-12",
    category: "Cooking",
    avatar: "null",
    duration: "1:23:15",
    isLive: true,
    subscribers: "320K",
    tags: ["Recipe", "Tutorial", "Healthy"],
  },
  {
    id: 6,
    title: "Italian Pasta Making",
    thumbnail: Place2,
    author: "ItalianNonna",
    views: "600K views",
    viewCount: 600000,
    time: "3 days ago",
    uploadDate: "2024-01-11",
    category: "Cooking",
    avatar: "null",
    duration: "1:15:30",
    isLive: false,
    subscribers: "450K",
    tags: ["Italian", "Traditional", "Homemade"],
  },
  {
    id: 7,
    title: "Late Night Talk Show",
    thumbnail: Place3,
    author: "TalkShow_Host",
    views: "800K views",
    viewCount: 800000,
    time: "3 days ago",
    uploadDate: "2024-01-11",
    category: "Talk Show",
    avatar: "null",
    duration: "3:12:45",
    isLive: false,
    subscribers: "1.5M",
    tags: ["Comedy", "Interview", "Entertainment"],
  },
  {
    id: 8,
    title: "Music Production Masterclass",
    thumbnail: Place4,
    author: "MusicProducer_Sam",
    views: "900K views",
    viewCount: 900000,
    time: "5 days ago",
    uploadDate: "2024-01-09",
    category: "Music",
    avatar: "null",
    duration: "4:05:20",
    isLive: false,
    subscribers: "780K",
    tags: ["Production", "Tutorial", "Electronic"],
  },
  // Add more videos for each category...
];

const ViewAllCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [videos, setVideos] = useState(allVideos);
  const [filteredVideos, setFilteredVideos] = useState(allVideos);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const videosPerPage = 12;

  // Function to convert URL parameter back to proper category name
  const getCategoryName = (urlParam: string) => {
    const categoryMap: { [key: string]: string } = {
      gaming: "Gaming",
      cooking: "Cooking",
      "talk-show": "Talk Show",
      music: "Music",
    };
    return categoryMap[urlParam] || "Gaming";
  };

  // Category configurations
  const categoryConfig = {
    Gaming: {
      color: "purple",
      icon: "🎮",
      description: "Epic gaming content from top streamers",
      filters: [
        "Action",
        "Multiplayer",
        "Tournament",
        "Esports",
        "Creative",
        "FPS",
        "Battle Royale",
        "Squad",
      ],
    },
    Cooking: {
      color: "orange",
      icon: "👨‍🍳",
      description: "Delicious recipes and cooking tutorials",
      filters: [
        "Recipe",
        "Tutorial",
        "Healthy",
        "Italian",
        "Traditional",
        "Homemade",
      ],
    },
    "Talk Show": {
      color: "blue",
      icon: "🎙️",
      description: "Engaging conversations and entertainment",
      filters: ["Comedy", "Interview", "Entertainment"],
    },
    Music: {
      color: "green",
      icon: "🎵",
      description: "Music production and live performances",
      filters: ["Production", "Tutorial", "Electronic", "Live"],
    },
  };

  // Convert URL parameter to proper category name
  const currentCategory = getCategoryName(category || "gaming");
  const config =
    categoryConfig[currentCategory as keyof typeof categoryConfig] ||
    categoryConfig.Gaming;

  useEffect(() => {
    // Filter videos by category
    const categoryVideos = allVideos.filter(
      (video) => video.category === currentCategory
    );
    setVideos(categoryVideos);
    setFilteredVideos(categoryVideos);
    setCurrentPage(1);
  }, [currentCategory]);

  useEffect(() => {
    let filtered = [...videos];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tag filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((video) =>
        video.tags.includes(selectedFilter)
      );
    }

    // Sort
    switch (sortBy) {
      case "recent":
        filtered.sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
        break;
      case "popular":
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredVideos(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedFilter, sortBy, videos]);

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const currentVideos = filteredVideos.slice(
    startIndex,
    startIndex + videosPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section
          className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white`}
        >
          <div className="container mx-auto px-6 lg:px-12 py-16">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate("/chat/stream/categories")}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="text-6xl">{config.icon}</div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  {currentCategory}
                </h1>
                <p className="text-xl opacity-90">{config.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                {filteredVideos.length} videos
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Eye className="w-4 h-4" />
                {filteredVideos
                  .reduce((acc, video) => acc + video.viewCount, 0)
                  .toLocaleString()}{" "}
                total views
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="container mx-auto px-6 lg:px-12 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${currentCategory.toLowerCase()} videos...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                {/* Tag Filter */}
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Tags</option>
                  {config.filters.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="alphabetical">A-Z</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-purple-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-purple-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Videos Grid/List */}
        <section className="container mx-auto px-6 lg:px-12 py-8">
          {currentVideos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No videos found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {currentVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer ${
                      viewMode === "list" ? "flex gap-4 p-4" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      className={`relative ${
                        viewMode === "list" ? "w-48 h-32 flex-shrink-0" : ""
                      }`}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className={`object-cover ${
                          viewMode === "list"
                            ? "w-full h-full rounded-lg"
                            : "w-full h-48"
                        }`}
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
                    <div
                      className={`${viewMode === "list" ? "flex-1" : "p-4"}`}
                    >
                      <h3
                        className={`font-semibold text-gray-900 mb-2 ${
                          viewMode === "list" ? "text-xl" : "text-lg"
                        } line-clamp-2`}
                      >
                        {video.title}
                      </h3>

                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={video.avatar} alt={video.author} />
                          <AvatarFallback className="bg-purple-500 text-white text-sm">
                            {video.author.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-gray-700 font-medium text-sm">
                            {video.author}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {video.subscribers} subscribers
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-gray-500 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {video.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {video.time}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {video.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={
                          currentPage === page
                            ? "bg-purple-500 hover:bg-purple-600"
                            : ""
                        }
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default ViewAllCategory;
