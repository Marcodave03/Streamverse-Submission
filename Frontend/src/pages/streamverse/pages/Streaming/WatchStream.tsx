import MainLayout from "../../layouts/MainLayout";
import { WifiOff, X } from "react-feather";
import { Download, Video, Send } from "react-feather";
import { useEffect, useRef, useState } from "react";
import { Input } from "../../../../components/streamverse/ui/input";
import { Button } from "../../../../components/streamverse/ui/button";
import { ScrollArea } from "../../../../components/streamverse/ui/scroll-area";
import { BASE_URL } from "@/config/constants";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import { StreamType } from "@/types/StreamTypes";
import { UserType } from "@/types/UserTypes";
import socket from "../../../../lib/webSocket";
import { useToaster } from "@/context/ToastContext";
import ProfilePicture from "../../../../components/streamverse/ProfilePicture";
import { ChatMessageType } from "@/types/StreamTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/streamverse/ui/tooltip";
import DonationPopover from "../../../../components/streamverse/Gift";

type StreamerResponse = {
  streamer: StreamType & { user: UserType };
  userProfile: UserType;
  is_followed: boolean;
};

const WatchStream = () => {
  const [user, , balance, fetchBalance] = useUser();
  const { topic_id } = useParams();
  const [streamInfo, setStreamInfo] = useState<StreamType | null>(null);
  const [streamer, setStreamer] = useState<
    (StreamType & { user: UserType }) | null
  >(null);

  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [showChat, setShowChat] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [message, setMessage] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [donationAmount, setDonationAmount] = useState("");
  const { toastSuccess, toastError } = useToaster();
  const [isFollowed, setIsFollowed] = useState(false);
  const [donateLoading, setDonateLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [streamEnded, setStreamEnded] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };
  const handleGiftChange = (amount: number) => {
    if (amount >= 1000000) {
      toastError("Maximum gift amount is 1,000,000 HBAR");
      return;
    } else if (amount <= 0) {
      toastError("Please give a valid amount");
      return;
    }
    setDonationAmount(amount.toString());
    setSelectedGift((prev) => (prev === amount ? null : amount));
  };

  useEffect(() => {
    const fetchStreamer = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }
      try {
        const response = await axios.get<StreamerResponse>(
          `${BASE_URL}/api/streamverse/streamer/${topic_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsFollowed(response.data.is_followed);
        setStreamInfo(response.data.streamer);
        setStreamer(response.data.streamer);
        console.log("FULL STREAMER RESPONSE:", response.data.streamer);
      } catch (error) {
        console.error("❌ Error fetching streamer:", error);
        if (axios.isAxiosError(error) && error.response) {
          console.log("Status:", error.response.status);
          console.log("Data:", error.response.data);
        }
        navigate("/home");
      }
    };
    fetchStreamer();
  }, []);

  useEffect(() => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", topic_id, event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
      setLiveStream(event.streams[0]);
    };

    socket.emit("join-room", topic_id, "watcher");

    socket.on("offer", async (offer) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit("answer", topic_id, answer);
        }
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        if (
          peerConnectionRef.current &&
          peerConnectionRef.current.signalingState !== "closed"
        ) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (error) {
        console.error("Error adding received ICE candidate:", error);
      }
    });

    socket.on("chat", (incomingMessage) => {
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    });

    socket.on("user-connected", () => {
      console.log("User connected");
      setViewerCount((prev) => prev + 1);
    });

    socket.on("user-disconnected", () => {
      console.log("User disconnected");
      setViewerCount((prev) => prev - 1);
    });

    socket.on("stop-stream", async () => {
      setStreamEnded(true); // <-- set flag that the stream has ended
      setLiveStream(null); // stop showing the video
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    });

    return () => {
      peerConnection.close();
      peerConnectionRef.current = null;
      socket.off("user-connected");
      socket.off("user-disconnected");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("stream-started");
      socket.off("chat");
      socket.emit("leave-room", topic_id);
    };
  }, [topic_id]);

  useEffect(() => {
    console.log(videoRef);
  }, [videoRef]);

  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === "") return;
    if (!user) return;
    const chatMessage: ChatMessageType = {
      fullName: user.username,
      content: message,
      timeStamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, chatMessage]);
    socket.emit("chat", topic_id, chatMessage);
    setMessage("");
  };

  const handleDonation = async (amount: string): Promise<void> => {
    console.log("🟢 handleDonation DEBUG START");
    console.log("👤 user object:", user);
    console.log("🎥 streamer object:", streamer);
    console.log("📤 user.hederaAccountId:", user?.hederaAccountId);
    console.log(
      "📥 streamer.user.hederaAccountId:",
      streamer?.user?.hederaAccountId
    );
    console.log("💸 donationAmount:", amount);
    console.log("🧾 topic_id:", topic_id);
    console.log("🟢 handleDonation DEBUG END");

    const token = localStorage.getItem("authToken");
    console.log("🔐 token:", localStorage.getItem("authToken"));
    if (!token) {
      console.error("No token found");
      return;
    }

    if (!streamer) {
      toastError("Streamer info not loaded yet.");
      return;
    }

    if (!user?.hederaAccountId || !streamer?.user?.hederaAccountId) {
      toastError("Missing user or streamer account");
      return;
    }

    if (Number(amount) <= 0 || Number(amount) >= 1000000) {
      toastError("Please give a valid amount");
      return;
    }

    try {
      setDonateLoading(true);
      const response = await axios.post<{ message: string }>(
        `${BASE_URL}/api/streamverse/donate`,
        {
          senderAccountId: user.hederaAccountId,
          receiverAccountId: streamer.user.hederaAccountId,
          amount,
          streamId: topic_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toastSuccess(response.data.message);
      fetchBalance();
    } catch (error: unknown) {
      console.error("Error during donation:", error);
      toastError("Failed to process donation");
    } finally {
      setDonateLoading(false);
    }
  };

  const handleFollow = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      setFollowLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/streamverse/follow/follow`,
        {
          followingId: streamer?.user?.user_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowed(true);
      toastSuccess(response.data.message);
    } catch (error: unknown) {
      console.error("Error during follow:", error);
      toastError(
        (axios.isAxiosError(error) && error.response?.data?.error) ||
          "Failed to follow streamer"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      setFollowLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/streamverse/follow/unfollow`,
        {
          followingId: streamer?.user?.user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowed(false);
      toastSuccess(response.data.message);
    } catch (error: unknown) {
      console.error("Error during unfollow:", error);
      if (axios.isAxiosError(error)) {
        toastError(error.response?.data?.error || "Failed to unfollow streamer");
      } else {
        toastError("Failed to unfollow streamer");
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout scrollable={false}>
      <div className="h-screen flex relative w-full overflow-y-hidden">
        <div className="flex flex-col w-full overflow-y-auto no-scrollbar">
          {!streamEnded ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-[36rem] object-cover rounded-md shadow-md"
            />
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center w-full bg-black min-h-[32rem] relative">
              <WifiOff size={48} className="text-gray-200" />
              <p className="text-gray-200 text-2xl">Stream Ended</p>
              <Button
                className="absolute bottom-6 right-6"
                onClick={() => navigate("/chat/stream")}
              >
                <Video className="mr-2" />
                Exit Stream
              </Button>
            </div>
          )}
          <div className="min-h-full flex flex-col p-6 gap-4">
            <div className="flex flex-col gap-4 justify-between md:flex-row">
              <div className="flex gap-4">
                <ProfilePicture
                  src={streamer?.user?.profile_picture}
                  username={streamer?.user?.username}
                />
                <div className="flex flex-col">
                  <p className="text-xl font-bold">
                    {streamer?.user?.username}
                  </p>
                  <p className="font-semibold">
                    {streamer?.user?.followerCount} Followers
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                {isFollowed ? (
                  <Button
                    disabled={followLoading}
                    onClick={handleUnfollow}
                    className="px-8 text-lg text-black border border-gray-300"
                    variant={"default"}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    disabled={followLoading}
                    onClick={handleFollow}
                    className="px-8 text-lg text-black border border-gray-300"
                    variant={"secondary"}
                  >
                    Follow
                  </Button>
                )}
                {streamer && (
                  <DonationPopover
                    user={user}
                    balance={Number(balance)}
                    streamer={{
                      hederaAccountId: streamer.user.hederaAccountId,
                      followerCount: streamer.user.followerCount,
                    }}
                    topic_id={topic_id!}
                    onDonate={handleDonation}
                    donationAmount={donationAmount}
                    setDonationAmount={setDonationAmount}
                    donateLoading={donateLoading}
                    selectedGift={selectedGift}
                    setSelectedGift={setSelectedGift}
                    handleGiftChange={handleGiftChange}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-semibold">{streamInfo?.title}</p>
              <div className="flex justify-between">
                <div className="flex gap-4 items-center text-darkPurple">
                  <Video size={24} />
                  <p className="text-lg font-bold">
                    {viewerCount} watching now
                  </p>
                </div>
              </div>
              <br />
              <div className="flex flex-col gap-4">
                <p className="font-bold text-xl">
                  About {streamer?.user?.username}
                </p>
                <div className="p-4 border-2 border-purple-500 rounded-sm bg-white">
                  <p>
                    {streamer?.user?.bio || "No bio available for this user"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {!showChat && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute flex items-center justify-center right-4 top-4 p-2 hover:bg-gray-200 rounded-md transition-all duration-300">
                    <button onClick={toggleChat}>
                      <Download size={32} className="rotate-90 text-gray-500" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-2">
                  <p className="text-md">Expand</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div
          className={
            "absolute top-0 right-0 w-64 max-w-64 flex flex-col sm:w-80 sm:max-w-80 h-screen sm:relative duration-200 bg-white ease-linear border-l sm:translate-x-0 " +
            (showChat ? "translate-x-0" : "sm:hidden translate-x-full")
          }
        >
          <div className="flex items-center w-full justify-between px-6 py-4 border-b drop-shadow-md">
            <p className="text-lg font-semibold">Live Chat</p>
            <X
              size={24}
              className="cursor-pointer"
              onClick={() => setShowChat(false)}
            />
          </div>
          <div className="bg-white flex flex-grow overflow-y-auto">
            {liveStream && (
              <ScrollArea className="px-4 py-2 flex-grow flex flex-col gap-2 flex-wrap">
                {messages.map((msg, index) => (
                  <p key={index} className="whitespace-pre-wrap break-words">
                    <strong>{msg.fullName}:</strong> {msg.content}
                  </p>
                ))}
              </ScrollArea>
            )}
            {!liveStream && (
              <div className="flex-grow flex flex-col gap-4 items-center justify-center pb-16">
                <WifiOff size={32} className="text-gray-300" />
                <p className="text-lg text-gray-400">Chat is offline</p>
              </div>
            )}
          </div>
          {liveStream && (
            <div className="p-3 min-h-[11.4rem] border-t bg-white ">
              <p className="text-md font-semibold mb-1 text-purple-700">
                Send Chat
              </p>
              <form onSubmit={handleMessageSubmit} className="flex gap-2">
                <Input
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" className="flex items-center gap-1">
                  <Send size={16} />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default WatchStream;
