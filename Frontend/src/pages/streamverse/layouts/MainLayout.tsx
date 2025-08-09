import { PropsWithChildren, useEffect, useState } from "react";
import Sidebar from "../../../components/streamverse/Sidebar";
import { Menu, Search, Settings, User } from "react-feather";
import { Input } from "../../../components/streamverse/ui/input";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/streamverse/ui/dropdown-menu";
import ProfilePicture from "../../../components/streamverse/ProfilePicture";

type MainLayoutProps = PropsWithChildren & {
  scrollable?: boolean;
};

const MainLayout = ({ scrollable = true, children }: MainLayoutProps) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, fetchUser, balance] = useUser();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("No token found, redirecting to home");
        navigate("/");
        return;
      }

      localStorage.removeItem("authToken");
      fetchUser();
      navigate("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error logging out";
      console.error("Logout error:", errorMessage);
      localStorage.removeItem("authToken");
      navigate("/");
    }
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/chat/stream/search/${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Sidebar show={showSidebar} toggleShow={toggleSidebar} />
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 z-[800] bg-black bg-opacity-20"
        />
      )}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <header className="sticky top-0 z-50 flex w-full bg-white border-b border-gray-200">
          <div className="flex flex-grow items-center justify-between py-4 px-3 sm:p-5">
            <div className="flex w-full gap-2 sm:gap-4 items-center">
              <button
                onClick={toggleSidebar}
                className="block lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="text-gray-600" size={20} />
              </button>
              <form onSubmit={onSearch} className="flex-1 max-w-xl">
                <div className="relative">
                  <Search
                    className="hidden sm:block absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-50 text-gray-800 pl-4 sm:pl-10 pr-4 h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                    placeholder="Search..."
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-3">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                      <ProfilePicture
                        src={user.profile_picture}
                        username={user.username}
                      />
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-800">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500">{balance} HBAR</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-800">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        Balance: {balance} HBAR
                      </p>
                    </div>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => navigate("/chat/stream/account")}
                        className="cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Account
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600 hover:text-red-700"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>
        <main className={scrollable ? "" : "overflow-y-hidden"}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
