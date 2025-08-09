import type React from "react";

import MainLayout from "../../layouts/MainLayout";
import { X, Maximize, Minimize } from "react-feather";
import {
  Download,
  Video,
  WifiOff,
  Send,
  Camera,
  CameraOff,
} from "react-feather";
import { useEffect, useRef, useState } from "react";
import { Input } from "../../../../components/streamverse/ui/input";
import { useDropzone } from "react-dropzone";
import { ScrollArea } from "../../../../components/streamverse/ui/scroll-area";
import { useUser } from "@/context/UserContext";
import ProfilePicture from "../../../../components/streamverse/ProfilePicture";
import useBase64 from "@/hooks/useBase64";
import type { StreamType } from "@/types/StreamTypes";
import { BASE_URL } from "@/config/constants";
import axios from "axios";
import { Button } from "../../../../components/streamverse/ui/button";
import { useParams } from "react-router-dom";
import socket from "@/lib/webSocket";
import type { ChatMessageType } from "@/types/StreamTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/streamverse/ui/tooltip";

// Import Avatar component dan Three.js dependencies
import { Canvas } from "@react-three/fiber";
import { Avatar } from "../../../../components/avatar/Avatar";
import { OrbitControls } from "@react-three/drei";

// Helper function to generate unique ID
const generateTopicId = (): string => {
  return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const MyChannel = () => {
  const [user] = useUser();
  const { topic_id: urlTopicId } = useParams();
  const [message, setMessage] = useState("");

  // Generate or use topic_id - this is the main fix
  const [topicId] = useState<string>(() => {
    // Priority: URL param > user stream ID > generate new one
    return (
      urlTopicId ||
      (user?.stream?.id ? String(user.stream.id) : "") ||
      generateTopicId()
    );
  });

  const [stream] = useState<StreamType>(user?.stream || ({} as StreamType));
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Fixed avatar camera settings - default values
  const [avatarCameraPosition] = useState([0, 25, 7]); // Face close-up
  const [avatarZoom] = useState(15);

  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const [title, setTitle] = useState<string>(
    () => stream?.title || user?.stream?.title || "Untitled Stream"
  );
  const { base64List, processImagesToBase64 } = useBase64();
  const [uploadedImage, setUploadedImage] = useState<string>(
    () => stream?.thumbnail || user?.stream?.thumbnail || ""
  );

  // Avatar related states
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [isAvatarMode, setIsAvatarMode] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("/models/girl1.glb");
  const [avatarExpression, setAvatarExpression] = useState("default");
  const [showAvatarControls, setShowAvatarControls] = useState(false);

  // Draggable position states
  const [cameraPosition, setCameraPosition] = useState({ x: 16, y: 16 }); // bottom-4 right-4 equivalent
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  // New function to toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isFullScreen]);

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
    socket.emit("chat", topicId, chatMessage);
    setMessage("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/*",
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      console.log("Dropped files:", acceptedFiles);
      if (acceptedFiles && acceptedFiles.length > 0) {
        try {
          processImagesToBase64(acceptedFiles);
        } catch (error) {
          console.error("Error processing images:", error);
        }
      }
    },
  });

  // Handle base64 update properly
  useEffect(() => {
    if (base64List && base64List.length > 0) {
      setUploadedImage(base64List[0]);
    }
  }, [base64List]);

  // Helper function to create room
  const createRoom = async (topicId: string) => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return false;
      }

      console.log("Creating room with topicId:", topicId);
      const response = await axios.post(
        `${BASE_URL}/api/streamverse/rooms`,
        { topic_id: topicId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Room created successfully:", response.data);
      return true;
    } catch (error: unknown) {
      console.error("Failed to create room:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response
          ?.status === "number"
      ) {
        const status = (error as { response: { status: number } }).response
          .status;
        if (status === 401) {
          console.error(
            "Authentication failed - token may be invalid or expired"
          );
          throw new Error("Authentication failed");
        } else if (status === 409) {
          console.log("Room already exists, continuing...");
          return true;
        } else if (status === 404) {
          console.error("Stream not found - cannot create room");
          throw new Error(
            "Stream not found. Please try starting the stream first."
          );
        } else {
          const errorMessage =
            typeof error === "object" && error !== null && "message" in error
              ? (error as { message?: string }).message
              : String(error);
          console.error("Unexpected error creating room:", errorMessage);
          throw new Error("Failed to create room");
        }
      } else {
        throw error;
      }
    }
  };

  // WebRTC and Socket setup
  useEffect(() => {
    if (!topicId || !isStreamActive) {
      console.log("Skipping WebRTC setup - no topicId or stream not active");
      return;
    }

    console.log("Setting up WebRTC with topicId:", topicId);
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", topicId, event.candidate);
      }
    };

    peerConnection.onnegotiationneeded = async () => {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("offer", topicId, offer);
      } catch (error) {
        console.error("Error creating or setting offer:", error);
      }
    };

    socket.on("answer", async (answer) => {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding received ICE candidate:", error);
      }
    });

    socket.on("chat", (incomingMessage) => {
      console.log("Incoming chat message:", incomingMessage);
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    });

    socket.emit("join-room", topicId, "streamer");

    socket.on("user-connected", ({ id, role }) => {
      console.log(`New user connected: ${id} as ${role}`);
      if (role === "watcher") {
        const event = new Event("negotiationneeded");
        peerConnection.onnegotiationneeded?.(event);
      }
    });

    return () => {
      console.log("Cleaning up WebRTC for topicId:", topicId);
      peerConnection.close();
      peerConnectionRef.current = null;
      socket.emit("stop-stream", topicId);
      socket.off("answer");
      socket.off("offer");
      socket.off("user-connected");
      socket.off("user-disconnected");
      socket.off("ice-candidate");
      socket.off("chat");
    };
  }, [topicId, isStreamActive]);

  // Enhanced toggleCameraOverlay function
  const toggleCameraOverlay = async () => {
    if (cameraStream || isAvatarMode) {
      // Turn off camera/avatar
      console.log("Turning off camera overlay");
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          track.stop();
          console.log("Stopped camera track:", track.kind);
        });
        setCameraStream(null);
      }
      setIsAvatarMode(false);
      setShowAvatarControls(false);

      // Clear the video element
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
    } else {
      // Show camera options modal
      setShowCameraOptions(true);
    }
  };

  // Function untuk start camera biasa
  const startNormalCamera = async () => {
    try {
      console.log("Starting normal camera...");
      const newCamStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: "user",
        },
        audio: false,
      });

      console.log("Camera access granted");
      setCameraStream(newCamStream);
      setIsAvatarMode(false);
      setShowCameraOptions(false);

      // Set up the video element
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = newCamStream;
      }
    } catch (error) {
      console.error("Failed to access camera:", error);
      alert(
        "Failed to access camera. Please allow camera permissions and try again."
      );
    }
  };

  // Function untuk start avatar mode
  const startAvatarMode = () => {
    console.log("Starting avatar mode");
    setIsAvatarMode(true);
    setShowCameraOptions(false);
    setShowAvatarControls(true);

    // Create a mock stream for avatar tracking
    setCameraStream(new MediaStream());
  };

  // Avatar model options
  const avatarModels = [
    { id: "girl1", name: "Girl 1", path: "/models/girl1.glb" },
    { id: "girl2", name: "Girl 2", path: "/models/girl2.glb" },
    { id: "girl3", name: "Girl 3", path: "/models/girl3.glb" },
    { id: "girl4", name: "Girl 4", path: "/models/girl4.glb" },
    { id: "girl5", name: "Girl 5", path: "/models/girl5.glb" },
    { id: "girl6", name: "Girl 6", path: "/models/girl6.glb" },
    { id: "girl7", name: "Girl 7", path: "/models/girl7.glb" },
    { id: "girl8", name: "Girl 8", path: "/models/girl8.glb" },
    { id: "girl9", name: "Girl 9", path: "/models/girl9.glb" },
    { id: "girl10", name: "Girl 10", path: "/models/girl10.glb" },
    { id: "girl11", name: "Girl 11", path: "/models/girl11.glb" },
    { id: "girl12", name: "Girl 12", path: "/models/girl12.glb" },
  ];

  // Expression options
  const expressionOptions = [
    { id: "default", name: "Default", emoji: "😐" },
    { id: "smile", name: "Smile", emoji: "😊" },
    { id: "sad", name: "Sad", emoji: "😢" },
    { id: "surprised", name: "Surprised", emoji: "😲" },
    { id: "angry", name: "Angry", emoji: "😠" },
    { id: "funnyFace", name: "Funny", emoji: "🤪" },
    { id: "crazy", name: "Crazy", emoji: "🤯" },
  ];

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.querySelector(
      ".camera-container"
    ) as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    // Constrain to container bounds
    const maxX = containerRect.width - 192; // 192px is w-48 width
    const maxY = containerRect.height - 128; // 128px is h-32 height

    setCameraPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Avatar Canvas Component - Simplified (removed settings button)
  const AvatarCanvas = ({
    className,
    style,
  }: {
    className: string;
    style?: React.CSSProperties;
  }) => (
    <div
      className={`${className} rounded-lg shadow-lg relative overflow-hidden cursor-move`}
      style={style}
      onMouseDown={handleMouseDown}
    >
      <Canvas
        camera={{
          position: avatarCameraPosition as [number, number, number],
          fov: 50,
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, 5]} intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={0.3} />

        <group scale={[avatarZoom, avatarZoom, avatarZoom]}>
          <Avatar
            expression={avatarExpression}
            animation={null}
            mouthCues={[]}
            audioDuration={0}
            modelUrl={selectedAvatar}
          />
        </group>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={false}
          minDistance={1}
          maxDistance={8}
          target={[0.5, 24, 0]} // Look at avatar's face level
        />
      </Canvas>
    </div>
  );

  // Camera Options Modal Component
  const CameraOptionsModal = () => {
    if (!showCameraOptions) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Choose Camera Option</h3>

          <div className="space-y-3">
            <button
              onClick={startNormalCamera}
              className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Camera size={20} />
              <div className="text-left">
                <p className="font-medium">Use Real Camera</p>
                <p className="text-sm text-gray-500">Show yourself on stream</p>
              </div>
            </button>

            <button
              onClick={startAvatarMode}
              className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <div className="text-left">
                <p className="font-medium">Use Avatar</p>
                <p className="text-sm text-gray-500">
                  Show animated avatar instead
                </p>
              </div>
            </button>
          </div>

          <button
            onClick={() => setShowCameraOptions(false)}
            className="w-full mt-4 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Avatar Controls Modal Component - Simplified with debug
  const AvatarControlsModal = () => {
    console.log(
      "AvatarControlsModal render, showAvatarControls:",
      showAvatarControls
    );

    if (!showAvatarControls) return null;

    return (
      <div className="fixed top-20 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Avatar Controls</h3>
          <button
            onClick={() => {
              console.log("Closing avatar controls");
              setShowAvatarControls(false);
            }}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Avatar Model Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Choose Model:</p>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {avatarModels.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  console.log("Selected avatar:", model.path);
                  setSelectedAvatar(model.path);
                }}
                className={`p-2 text-xs rounded border ${
                  selectedAvatar === model.path
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {/* Expression Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Expression:</p>
          <div className="grid grid-cols-4 gap-2">
            {expressionOptions.map((expr) => (
              <button
                key={expr.id}
                onClick={() => {
                  console.log("Selected expression:", expr.id);
                  setAvatarExpression(expr.id);
                }}
                className={`p-2 text-xs rounded border ${
                  avatarExpression === expr.id
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                }`}
                title={expr.name}
              >
                {expr.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Camera video effect
  useEffect(() => {
    if (cameraStream && cameraVideoRef.current && !isAvatarMode) {
      cameraVideoRef.current.srcObject = cameraStream;
      cameraVideoRef.current.play().catch((error) => {
        console.error("Error playing camera video:", error);
      });
    }
  }, [cameraStream, isAvatarMode]);

  // Start stream function
  const startStream = async () => {
    if (!topicId) {
      console.error("No topicId available");
      alert("Unable to start stream - no topic ID generated");
      return;
    }

    const currentTitle = title.trim();
    const currentThumbnail = uploadedImage;

    if (!currentTitle) {
      console.error("Stream title is required");
      alert("Please enter a stream title before going live");
      return;
    }

    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        alert("Please log in to start streaming");
        return;
      }

      console.log("Starting stream with:", {
        topicId,
        title: currentTitle,
        thumbnail: currentThumbnail ? "Present" : "None",
      });

      // Create/Update stream
      const streamResponse = await axios.post(
        `${BASE_URL}/api/streamverse/streams`,
        {
          topic_id: topicId,
          title: currentTitle,
          thumbnail: currentThumbnail || null,
          stream_url: topicId,
          is_live: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Stream created/updated successfully:", streamResponse.data);

      // Start the stream
      const startResponse = await axios.patch(
        `${BASE_URL}/api/streamverse/start-stream`,
        {
          title: currentTitle,
          thumbnail: currentThumbnail || null,
          topic_id: topicId,
          stream_url: topicId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Stream started successfully:", startResponse.data);

      // Create room
      console.log("Creating room...");
      await createRoom(topicId);

      // Get screen capture
      console.log("Getting screen capture...");
      const newStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      });

      setLiveStream(newStream);
      setIsStreamActive(true);

      // Notify about stream start
      socket.emit("stream-started", topicId);
      console.log("Stream started successfully with title:", currentTitle);
    } catch (error: unknown) {
      console.error("Error starting stream:", error);
    }
  };

  // Add tracks to peer connection when liveStream changes
  useEffect(() => {
    if (liveStream && peerConnectionRef.current && isStreamActive) {
      console.log("Adding tracks to peer connection...");
      liveStream.getTracks().forEach((track) => {
        peerConnectionRef.current?.addTrack(track, liveStream);
      });
    }
  }, [liveStream, isStreamActive]);

  // Video stream effect
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = liveStream;
      videoRef.current.play().catch((error) => {
        console.error("Error playing the video stream:", error);
      });
    }

    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.srcObject = liveStream;
      fullscreenVideoRef.current.play().catch((error) => {
        console.error("Error playing the fullscreen video stream:", error);
      });
    }

    return () => {
      if (liveStream) {
        liveStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [liveStream]);

  useEffect(() => {
    if (isFullScreen && liveStream && fullscreenVideoRef.current) {
      fullscreenVideoRef.current.srcObject = liveStream;
      fullscreenVideoRef.current.play().catch((error) => {
        console.error(
          "Error playing fullscreen video on fullscreen enter:",
          error
        );
      });
    }
  }, [isFullScreen, liveStream]);

  const pauseStream = () => {
    if (liveStream) {
      liveStream.getTracks().forEach((track) => track.stop());
      setLiveStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    console.log("🔴 Stream paused, keeping room active");
    socket.emit("stream-paused", topicId);
  };

  const stopLiveSession = async () => {
    pauseStream();

    // Also stop camera if it's active
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    // Reset avatar mode
    setIsAvatarMode(false);
    setShowAvatarControls(false);

    setIsStreamActive(false);
    setIsFullScreen(false);

    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/api/streamverse/streams/${topicId}`,
        {
          is_live: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      socket.emit("stop-stream", topicId);
      console.log("🛑 Live session ended");
    } catch (error) {
      console.error("Error stopping live session:", error);
    }
  };

  // Loading state
  if (!user) {
    return (
      <MainLayout scrollable={false}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Full screen video component with improved implementation
  const FullScreenVideo = () => {
    const localFullscreenRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
      const connectVideo = () => {
        const videoElement =
          localFullscreenRef.current || fullscreenVideoRef.current;

        if (videoElement && liveStream) {
          console.log("Connecting fullscreen video stream...");
          videoElement.srcObject = liveStream;
          videoElement.load();

          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Fullscreen video playing successfully");
              })
              .catch((error) => {
                console.error("Error playing fullscreen video:", error);
                setTimeout(() => {
                  if (videoElement && liveStream) {
                    videoElement.srcObject = liveStream;
                    videoElement.play().catch(console.error);
                  }
                }, 500);
              });
          }
        }
      };

      connectVideo();
      const timer = setTimeout(connectVideo, 100);
      return () => clearTimeout(timer);
    }, [liveStream, showChat]);

    const setVideoRef = (element: HTMLVideoElement | null) => {
      localFullscreenRef.current = element;
      fullscreenVideoRef.current = element;
    };

    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center camera-container">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleFullScreen}
                className="absolute top-4 right-4 z-60 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-lg transition-all"
              >
                <Minimize size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exit Full Screen (ESC)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="absolute top-4 left-4 z-60 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleCameraOverlay}
                  variant={cameraStream || isAvatarMode ? "default" : "outline"}
                  className={`${
                    cameraStream || isAvatarMode
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  } bg-opacity-80 hover:bg-opacity-100`}
                >
                  {cameraStream || isAvatarMode ? (
                    <CameraOff className="w-4 h-4" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {cameraStream || isAvatarMode
                    ? "Turn Off Camera"
                    : "Camera Options"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {liveStream ? (
            <Button
              onClick={pauseStream}
              variant="outline"
              className="bg-opacity-80 hover:bg-opacity-100"
            >
              Pause Screen
            </Button>
          ) : (
            <Button
              onClick={startStream}
              variant="outline"
              className="bg-opacity-80 hover:bg-opacity-100"
            >
              Share Screen Again
            </Button>
          )}

          <Button
            onClick={stopLiveSession}
            variant="destructive"
            className="bg-opacity-80 hover:bg-opacity-100"
          >
            Stop Live
          </Button>
        </div>

        {liveStream ? (
          <video
            ref={setVideoRef}
            autoPlay
            muted
            playsInline
            className="w-screen h-screen object-contain"
            onLoadedMetadata={() => {
              console.log("Fullscreen video metadata loaded");
            }}
            onLoadedData={() => {
              console.log("Fullscreen video data loaded");
            }}
            onCanPlay={() => {
              console.log("Fullscreen video can play");
            }}
            onError={(e) => {
              console.error("Fullscreen video error:", e);
              const videoElement = e.currentTarget;
              if (videoElement && liveStream) {
                setTimeout(() => {
                  videoElement.srcObject = liveStream;
                  videoElement.play().catch(console.error);
                }, 1000);
              }
            }}
            style={{ backgroundColor: "transparent" }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
            <WifiOff size={64} className="mb-4" />
            <p className="text-xl">No stream available</p>
            <p className="text-sm opacity-70">
              Start screen sharing to see content
            </p>
          </div>
        )}

        {/* Camera/Avatar Overlay in full screen - Draggable */}
        {(cameraStream || isAvatarMode) && (
          <div
            className="absolute z-60"
            style={{
              left: `${cameraPosition.x}px`,
              top: `${cameraPosition.y}px`,
            }}
          >
            {isAvatarMode ? (
              <AvatarCanvas
                className="w-48 h-32"
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
              />
            ) : (
              <div
                className="relative cursor-move"
                onMouseDown={handleMouseDown}
              >
                <video
                  ref={cameraVideoRef}
                  className="w-48 h-32 rounded-lg shadow-lg object-cover"
                  muted
                  autoPlay
                  playsInline
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                />
                <button
                  onClick={toggleCameraOverlay}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-60">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleChat}
                  variant="outline"
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white border-white border-opacity-50"
                >
                  {showChat ? "Hide Chat" : "Show Chat"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showChat ? "Hide Chat" : "Show Chat"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };

  // Full screen render
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-black z-40">
        <div className="absolute inset-0">
          <FullScreenVideo />
        </div>

        {showChat && (
          <div className="absolute top-0 right-0 w-80 h-screen z-50 bg-white border-l shadow-lg">
            <div className="flex items-center w-full justify-between px-6 py-4 border-b drop-shadow-md">
              <p className="text-lg font-semibold">Live Chat</p>
              <X
                size={24}
                className="cursor-pointer"
                onClick={() => setShowChat(false)}
              />
            </div>

            <div className="bg-white flex-grow flex overflow-y-auto h-[calc(100vh-180px)]">
              <ScrollArea className="px-4 py-2 flex-grow">
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div key={index} className="mb-2">
                      <strong>{message.fullName}:</strong> {message.content}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No messages yet...</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="p-3 border-t bg-white absolute bottom-0 left-0 right-0">
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
          </div>
        )}
      </div>
    );
  }

  // Normal mode render
  return (
    <MainLayout scrollable={false}>
      <div className="h-screen flex relative w-full overflow-y-hidden">
        <div className="flex flex-col w-full overflow-y-auto no-scrollbar">
          {/* Main Video Area with Camera Overlay */}
          {liveStream ? (
            <div className="relative w-full camera-container">
              {/* Main Screen Share Video */}
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full object-cover max-h-[36rem] rounded-md shadow-md"
              />

              {/* Full screen button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleFullScreen}
                      className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-lg transition-all"
                    >
                      <Maximize size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Full Screen</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Camera/Avatar Overlay - Draggable */}
              {(cameraStream || isAvatarMode) && (
                <div
                  className="absolute z-10"
                  style={{
                    left: `${cameraPosition.x}px`,
                    top: `${cameraPosition.y}px`,
                  }}
                >
                  {isAvatarMode ? (
                    <AvatarCanvas
                      className="w-48 h-32"
                      style={{ cursor: isDragging ? "grabbing" : "grab" }}
                    />
                  ) : (
                    <div
                      className="relative cursor-move"
                      onMouseDown={handleMouseDown}
                    >
                      <video
                        ref={cameraVideoRef}
                        className="w-48 h-32 rounded-lg shadow-lg object-cover"
                        muted
                        autoPlay
                        playsInline
                        style={{ cursor: isDragging ? "grabbing" : "grab" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center w-full bg-black min-h-[32rem] relative rounded-md shadow-md">
              {uploadedImage ? (
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Stream thumbnail"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <>
                  <WifiOff size={48} className="text-gray-200" />
                  <p className="text-gray-200 text-2xl">Stream paused</p>
                </>
              )}
              <Button
                className="absolute bottom-6 right-6"
                onClick={startStream}
              >
                <Video className="mr-2" />
                Share Screen Again
              </Button>
            </div>
          )}

          <div className="min-h-full flex flex-col p-6 gap-4">
            <div className="flex flex-col gap-4 justify-between md:flex-row">
              <div className="flex gap-4 items-center">
                <ProfilePicture
                  src={user.profile_picture || ""}
                  username={user.username || "User"}
                  className="w-16 h-16"
                />
                <div className="flex flex-col">
                  <p className="text-xl font-bold">{user.username || "User"}</p>
                  <p className="font-semibold text-darkPurple">
                    {user.followerCount || 0} Followers
                  </p>
                  <p className="text-xs text-gray-500">Topic ID: {topicId}</p>
                </div>

                {/* Stream Controls */}
                {isStreamActive && (
                  <div className="flex gap-2 ml-4">
                    {/* Camera Toggle Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={toggleCameraOverlay}
                            variant={
                              cameraStream || isAvatarMode
                                ? "default"
                                : "outline"
                            }
                            className={
                              cameraStream || isAvatarMode
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            {cameraStream || isAvatarMode ? (
                              <CameraOff className="w-4 h-4" />
                            ) : (
                              <Camera className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {cameraStream || isAvatarMode
                              ? "Turn Off Camera"
                              : "Camera Options"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Avatar Settings Button - Only show when avatar is active */}
                    {isAvatarMode && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(
                                  "Avatar settings clicked, current state:",
                                  showAvatarControls
                                );
                                setShowAvatarControls(!showAvatarControls);
                              }}
                              variant="outline"
                              className="bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
                            >
                              ⚙
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Avatar Settings</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Screen Share Controls */}
                    {liveStream ? (
                      <Button onClick={pauseStream} variant="outline">
                        Pause Screen
                      </Button>
                    ) : (
                      <Button onClick={startStream} variant="outline">
                        Share Screen Again
                      </Button>
                    )}

                    {/* Stop Stream Button */}
                    <Button onClick={stopLiveSession} variant="destructive">
                      Stop Live
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Stream Configuration */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-lg font-bold">Set your stream title</p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 py-6 text-lg"
                  placeholder="Enter your stream title..."
                  maxLength={100}
                />
              </div>

              <div>
                <p className="text-lg font-bold">Set your thumbnail</p>
                <div
                  {...getRootProps()}
                  className={`mt-2 flex items-center justify-center max-w-96 h-64 rounded-md cursor-pointer transition-colors ${
                    uploadedImage
                      ? ""
                      : `border-2 border-dashed border-gray-400 ${
                          isDragActive
                            ? "border-blue-500 bg-blue-50"
                            : "hover:border-gray-500"
                        }`
                  }`}
                >
                  <input {...getInputProps()} />
                  {uploadedImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Thumbnail"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                        <p className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200">
                          Click to change thumbnail
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center px-6">
                      <p className="text-lg text-black">
                        {isDragActive
                          ? "Drop files here"
                          : "Drag 'n' drop your thumbnail here, or click to select"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Supported formats: JPEG, PNG, GIF, WebP
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Toggle Button */}
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

        {/* Chat Panel */}
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

          <div className="bg-white flex-grow flex overflow-y-auto">
            {liveStream ? (
              <ScrollArea className="px-4 py-2 flex-grow">
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div key={index} className="mb-2">
                      <strong>{message.fullName}:</strong> {message.content}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No messages yet...</p>
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="flex-grow flex flex-col gap-4 items-center justify-center pb-16">
                <WifiOff size={32} className="text-gray-300" />
                <p className="text-lg text-gray-400">Chat not available</p>
              </div>
            )}
          </div>

          {liveStream && (
            <div className="p-3 min-h-[11.4rem] border-t bg-white">
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

      {/* Camera Options Modal */}
      <CameraOptionsModal />

      {/* Avatar Controls Modal */}
      <AvatarControlsModal />
    </MainLayout>
  );
};

export default MyChannel;
