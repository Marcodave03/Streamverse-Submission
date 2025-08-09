import MainLayout from "../../layouts/MainLayout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/config/constants";
// import { SearchStreamType } from "@/types/StreamTypes";
import { Stream } from "@/types/StreamsType";

import { Skeleton } from "../../../../components/streamverse/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/streamverse/ui/tabs";
import LiveVideoCard from "../../../../components/streamverse/LiveVideoCard";

const SearchPage = () => {
  const { search } = useParams();
  const [streams, setStreams] = useState<Stream[] | null>(null);
  const [streamLoading, setStreamLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStreams = async () => {
      setStreamLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(
          `${BASE_URL}/api/streamverse/search/${search}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStreams(response.data?.streams || []);
      } catch (error) {
        console.error("Stream search error:", error);
      } finally {
        setStreamLoading(false);
      }
    };

    if (search) {
      fetchStreams();
    }
  }, [search]);

  return (
    <MainLayout>
      <div className="p-8">
        <Tabs value="stream">
          <TabsList className="flex flex-row w-full justify-start mb-4 pb-2 border-b-2 border-gray-300 rounded-none">
            <TabsTrigger value="stream" className="text-black text-lg pb-2">
              Streams
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stream">
            {streamLoading ? (
              <div className="flex flex-col gap-4 w-full md:max-w-[60%]">
                {[...Array(2)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white shadow-md rounded-lg"
                  >
                    <Skeleton className="w-full md:w-64 h-40" />
                    <div className="flex flex-col gap-2.5 w-full">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <Skeleton className="h-6 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : streams?.length === 0 ? (
              <p className="text-lg text-gray-500">
                No results found. Try searching for something else.
              </p>
            ) : (
              <div className="flex flex-col gap-4 w-full md:max-w-[60%] pt-4">
                {streams?.map((stream) => (
                  <LiveVideoCard stream={stream} key={stream.id} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SearchPage;























// import MainLayout from "../../layouts/MainLayout";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { BASE_URL } from "@/config/constants";
// import { SearchStreamType } from "@/types/StreamTypes";
// import { Skeleton } from "../../../../components/streamverse/ui/skeleton";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/streamverse/ui/tabs";
// import { SearchUserType } from "@/types/UserTypes";
// import ProfilePicture from "../../../../components/streamverse/ProfilePicture";

// const SearchPage = () => {
//   const { search, tab } = useParams(); // Get 'tab' from URL parameters
//   const navigate = useNavigate();
//   const [streams, setStreams] = useState<SearchStreamType[] | null>(null);
//   const [channels, setChannels] = useState<SearchUserType[] | null>(null);
//   const [streamLoading, setStreamLoading] = useState<boolean>(true);
//   const [channelLoading, setChannelLoading] = useState<boolean>(false);
//   const [searchTerm, setSearchTerm] = useState<string>("");

//   useEffect(() => {
//     const fetchStreams = async () => {
//       setStreamLoading(true);
//       try {
//         const response = await axios.get(`${BASE_URL}/api/streamverse/stream/search/${search}`);
//         {
//         //   headers: {
//         //     Authorization: `Bearer ${token}`,
//         //   },
//         // }
//         setStreams(response.data);
//       } catch (error) {
//         console.log(error);
//       } finally {
//         setStreamLoading(false);
//       }
//     };

//     const fetchChannels = async () => {
//       setChannelLoading(true);
//       try {
//         const response = await axios.get(`${BASE_URL}/api/streamverse/user/name/${search}`);
//         setChannels(response.data);
//         console.log(response.data);
//       } catch (error) {
//         console.log(error);
//       } finally {
//         setChannelLoading(false);
//       }
//     };

//     if (search !== searchTerm) {
//       setStreams(null);
//       setChannels(null);
//       setSearchTerm(search || "");
//       fetchStreams();
//       fetchChannels();
//     }
//   }, [search, searchTerm]);

//   // Function to handle tab change and update URL
//   const handleTabChange = (value: string) => {
//     navigate(`/search/${search}/${value}`); // Update URL with tab value
//   };

//   return (
//     <MainLayout>
//       <div className="p-8">
//         <Tabs
//           value={tab || "stream"} // Default to 'stream' tab if no tab is in the URL
//           onValueChange={handleTabChange} // Update the tab value in the URL when a tab is selected
//         >
//           <TabsList className="flex flex-row w-full justify-start mb-4 pb-2 border-b-2 border-gray-300 rounded-none">
//             <TabsTrigger value="stream" className="text-black text-lg pb-2">
//               Streams
//             </TabsTrigger>
//             <TabsTrigger value="channels" className="text-black text-lg pb-2">
//               Channels
//             </TabsTrigger>
//           </TabsList>
//           <TabsContent value="stream">
//             {streamLoading ? (
//               <div className="flex flex-col gap-4 w-full md:max-w-[60%]">
//                 {[...Array(2)].map((_, index) => (
//                   <div
//                     key={index}
//                     className="flex items-start gap-4 p-4 bg-white shadow-md rounded-lg"
//                   >
//                     <Skeleton className="w-full md:w-64 h-40" />
//                     <div className="flex flex-col gap-2.5 w-full">
//                       <Skeleton className="h-6 w-1/2" />
//                       <Skeleton className="h-4 w-1/3" />
//                       <div className="flex items-center gap-2">
//                         <Skeleton className="w-9 h-9 rounded-full" />
//                         <Skeleton className="h-6 w-1/2" />
//                       </div>
//                       <Skeleton className="h-4 w-1/3" />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : streams?.length === 0 ? (
//               <p className="text-lg text-gray-500">
//                 No results found. Try searching for something else
//               </p>
//             ) : (
//               <div className="flex flex-col gap-4 w-full md:max-w-[60%] pt-4">
//                 {streams?.map((stream) => (
//                   <StreamCard stream={stream} key={stream.id} />
//                 ))}
//               </div>
//             )}
//           </TabsContent>
//           <TabsContent value="channels">
//             {channelLoading ? (
//               <div className="flex flex-col gap-4 w-full md:max-w-[60%]">
//                 {[...Array(2)].map((_, index) => (
//                   <div
//                     key={index}
//                     className="flex items-start gap-4 p-4 bg-white shadow-md rounded-lg"
//                   >
//                     <Skeleton className="w-full md:w-64 h-40" />
//                     <div className="flex flex-col gap-2.5 w-full">
//                       <Skeleton className="h-6 w-1/2" />
//                       <Skeleton className="h-4 w-1/3" />
//                       <div className="flex items-center gap-2">
//                         <Skeleton className="w-9 h-9 rounded-full" />
//                         <Skeleton className="h-6 w-1/2" />
//                       </div>
//                       <Skeleton className="h-4 w-1/3" />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : channels?.length === 0 || !channels ? (
//               <p className="text-lg text-gray-500">
//                 No results found. Try searching for something else
//               </p>
//             ) : (
//               <div className="flex flex-col gap-6 w-full md:max-w-[60%] pl-4 pt-6">
//                 {channels.map((channel) => (
//                   <div
//                     key={channel.topic_id}
//                     className="flex gap-6"
//                     onClick={() => navigate(`/stream/${channel.topic_id}`)}
//                   >
//                     <ProfilePicture
//                       src={channel.profile_picture}
//                       className="w-28 h-28"
//                     />
//                     <div className="flex flex-col gap-1 py-2">
//                       <p className="text-black font-bold text-xl">
//                         {channel.full_name}
//                       </p>
//                       <p className="text-black font-semibold text-lg">
//                         {channel.followerCount} Followers
//                       </p>
//                       <p className="text-black whitespace-wrap overflow-hidden text-ellipsis line-clamp-2">
//                         {channel.bio ? channel.bio : "No bio available"}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       </div>
//     </MainLayout>
//   );
// };

// export default SearchPage;
