import { X, Home, Video, Grid, Users } from "react-feather";
import { Link, useLocation } from "react-router-dom";
import SidebarLink from "./SidebarLink";
import ProfileStatus from "./ProfileStatus";
import { Accordion, AccordionContent, AccordionTrigger } from "./ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config/constants";
import axios from "axios";

type SidebarProps = {
  show?: boolean;
  toggleShow: React.Dispatch<React.SetStateAction<boolean>>;
};

type FollowingType = {
  fullName: string;
  isLive: boolean;
  topicId: string | null;
  followingId: number;
  profilePicture: string | null;
  bio: string;
};

type UserType = {
  id: string;
  username: string;
  bio: string;
  profile_picture: string;
  stream?: {
    topic_id: string;
  };
};

const Sidebar = ({ show = true, toggleShow }: SidebarProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [followings, setFollowings] = useState<FollowingType[] | null>(null);
  const [loadingFollowings, setLoadingFollowings] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Fetch account data
  const fetchAccount = async () => {
    setLoadingUser(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${BASE_URL}/api/account/account-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        throw new Error(data.message || "Failed to fetch account");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch account");
        console.error("Failed to fetch account:", err);
      } else {
        setError("Failed to fetch account");
        console.error("Failed to fetch account:", err);
      }
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch followings independently
  const fetchFollowings = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      setFollowings([]);
      return;
    }

    setLoadingFollowings(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/streamverse/follow/following`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Following response:", response.data);
      setFollowings(response.data);
    } catch (error) {
      console.error("Failed to fetch followings:", error);
      setFollowings([]);
    } finally {
      setLoadingFollowings(false);
    }
  };

  // Fetch both user data and followings on component mount
  useEffect(() => {
    fetchAccount();
    fetchFollowings();
  }, []);

  // Helper function to check if a path is active
  const isActiveRoute = (path: string) => {
    if (path === "/home") {
      return (
        location.pathname === "/" ||
        location.pathname === "/home" ||
        location.pathname === "/chat/stream" ||
        location.pathname === "/chat/stream/"
      );
    }
    if (path === "/chat/stream/categories") {
      return (
        location.pathname === "/chat/stream/categories" ||
        location.pathname.startsWith("/chat/stream/categories/")
      );
    }
    // For dynamic paths (like /stream/topic_id), do exact match
    return location.pathname === path;
  };

  return (
    <aside
      className={
        "absolute left-0 top-0 z-[999] flex h-screen w-72 lg:w-1/5 xl:w-1/6 flex-col overflow-y-hidden bg-white shadow-xl border-r border-gray-200 duration-300 ease-in-out lg:static lg:translate-x-0 " +
        (show ? "translate-x-0" : "-translate-x-full")
      }
    >
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <Link
            to="/chat/stream/"
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Video size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-200">
              StreamVerse
            </span>
          </Link>
          <button
            onClick={() => toggleShow(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="text-gray-600" size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <nav className="py-4 px-4">
          <div className="space-y-2">
            <div className="space-y-1">
              <SidebarLink
                to="/chat/stream/"
                icon={<Home size={20} />}
                isActive={isActiveRoute("/home")}
              >
                For You
              </SidebarLink>
              <SidebarLink
                to={`/chat/stream/${user?.stream?.topic_id || "my-channel"}`}
                icon={<Video size={20} />}
                isActive={
                  isActiveRoute(`/chat/stream/${user?.stream?.topic_id}`) ||
                  location.pathname === "/chat/stream/my-channel"
                }
              >
                My Channel
              </SidebarLink>
              <SidebarLink
                to="/chat/stream/categories"
                icon={<Grid size={20} />}
                isActive={isActiveRoute("/chat/stream/categories")}
              >
                Categories
              </SidebarLink>
            </div>

            {/* Following section - independent of user loading */}
            <div className="space-y-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="following" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Users size={20} className="text-gray-600" />
                      <span className="text-gray-700 font-medium">
                        Following
                      </span>
                      {followings && followings.length > 0 && (
                        <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {followings.length}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-0">
                    <div className="space-y-1 ml-6">
                      {loadingFollowings ? (
                        <div className="flex items-center space-x-2 py-2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-500">
                            Loading...
                          </span>
                        </div>
                      ) : followings && followings.length > 0 ? (
                        followings.map((following) => (
                          <div key={following.followingId} className="py-1">
                            <ProfileStatus
                              username={following.fullName}
                              online={following.isLive}
                              topicId={following.topicId || undefined}
                              avatar={following.profilePicture || undefined}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="py-3 text-center">
                          <p className="text-sm text-gray-500">
                            No one followed yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Follow streamers to see them here
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* User loading state */}
            {loadingUser && (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-500">
                  Loading user...
                </span>
              </div>
            )}

            {/* User error state */}
            {error && (
              <div className="py-4 px-3">
                <p className="text-sm text-red-500">{error}</p>
                <button
                  onClick={fetchAccount}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-700 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <p>© 2025 StreamVerse</p>
          <div className="flex space-x-3">
            <Link
              to="/privacy"
              className="hover:text-gray-700 transition-colors"
            >
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">
              Terms
            </Link>
            <Link to="/help" className="hover:text-gray-700 transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
