// components/MobileChatFrame.tsx

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Experience } from "../avatar/Experience";
import { MouthCue } from "../avatar/types/avatarTypes";

interface MobileChatFrameProps {
  expression: string | null;
  animation: string | null;
  mouthCues: MouthCue[];
  audioDuration: number;
  modelUrl: string;
  messages: { message: string; sender: string; direction: string }[];
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean) => void;
  typingText: string;
  isTyping: boolean;
  userInput: string;
  setUserInput: (val: string) => void;
  handleSend: () => void;
  isSpeechEnabled: boolean;
  toggleSpeech: () => void;
  isSpeaking: boolean;
  isRecording: boolean;
  toggleRecording: () => void;
  loadingTranscription: boolean;
}

export const MobileChatFrame: React.FC<MobileChatFrameProps> = ({
  expression,
  animation,
  mouthCues,
  audioDuration,
  modelUrl,
  messages,
  isChatOpen,
  setIsChatOpen,
  typingText,
  isTyping,
  userInput,
  setUserInput,
  handleSend,
  isSpeechEnabled,
  toggleSpeech,
  isSpeaking,
  isRecording,
  toggleRecording,
  loadingTranscription,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isChatOpen) return;

    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages.length, typingText, isChatOpen]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent">
      {/* Enlarged Avatar showing full body */}
      <div className="h-[850px] relative z-10">
        <Canvas
          shadows
          camera={{ position: [0, 0.2, 3], fov: 8 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ alpha: true, preserveDrawingBuffer: true }}
        >
          <Experience
            expression={expression}
            animation={animation}
            mouthCues={mouthCues}
            audioDuration={audioDuration}
            modelUrl={modelUrl}
          />
        </Canvas>
      </div>

      {/* Expandable Chat Bubble Frame (positioned above input) */}
      <motion.div
        initial={false}
        animate={{ height: isChatOpen ? 200 : 48 }}
        transition={{ type: "tween", duration: 0.5 }}
        className="absolute bottom-[64px] left-4 right-4 z-20 rounded-xl shadow-xl backdrop-blur-md flex flex-col"
      >
        {/* Toggle Chat Button */}
        <div className="flex justify-center py-2">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-gray-900 text-white text-sm font-semibold px-4 py-1 rounded-full shadow"
          >
            {isChatOpen ? "Hide Chat" : "Show Chat"}
          </button>
        </div>

        {/* Chat messages */}
        {isChatOpen && (
          <div className="flex-1 px-3 pt-2 overflow-y-auto space-y-2">
            {/* Friendly prompt if no messages yet */}
            {messages.length === 0 && !isTyping && !loadingTranscription && (
              <div className="flex justify-center mt-8">
                <div className="bg-white bg-opacity-90 text-gray-700 text-center px-4 py-3 rounded-xl text-sm shadow-md max-w-[80%]">
                  ✨ <span className="font-medium">Start chatting</span> by
                  typing a message below or tap the mic to speak!
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.direction === "outgoing" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] text-sm p-2 rounded-xl ${
                    msg.sender === "Maya"
                      ? "bg-white text-gray-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-2 rounded-xl text-sm flex items-center gap-1 min-h-[40px]">
                  {typingText || (
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {loadingTranscription && (
              <div className="flex justify-center py-2">
                <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </motion.div>

      {/* Fixed Input Bar - Always visible at the bottom */}
      <div className="absolute bottom-2 left-3 right-3 z-30">
        <div className="bg-gray-800 bg-opacity-90 rounded-full h-[48px] flex items-center px-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Start typing ..."
            className="w-full bg-transparent text-white placeholder-white placeholder-opacity-70 focus:outline-none px-2"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <div className="flex gap-3 items-center ml-2">
            <span
              onClick={toggleRecording}
              className={`text-white text-xl cursor-pointer ${
                isRecording ? "text-red-500 animate-pulse" : "opacity-50"
              }`}
            >
              🎙️
            </span>
            <span
              onClick={toggleSpeech}
              className={`text-white text-xl cursor-pointer ${
                isSpeechEnabled ? "opacity-100" : "opacity-50"
              } ${isSpeaking ? "animate-pulse" : ""}`}
            >
              🔈
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
