"use client";

import { useState, useEffect } from "react";

interface TutorPersonality {
  name: string;
  avatar: string;
  greeting: string;
  personality: string;
  expertise: string;
}

interface VisualizationData {
  title: string;
  description: string;
  mediaType: "image" | "video" | "animation" | "iframe";
  mediaSrc?: string;
  placeholder?: string;
}

interface AvatarTutorSectionProps {
  lessonId: number;
  tutorPersonality?: TutorPersonality;
  visualization?: VisualizationData;
  lessonContent?: string;
}

// Maya as the single tutor with different expertise for each lesson
const mayaTutor: Record<number, TutorPersonality> = {
  1: {
    name: "Maya",
    avatar: "🌐",
    greeting:
      "Hey there! I'm Maya, and I'll guide you through Hedera fundamentals.",
    personality: "enthusiastic and technical",
    expertise: "Hashgraph Technology",
  },
  2: {
    name: "Maya",
    avatar: "🔐",
    greeting: "Hi! I'm Maya, and I'll help you master Hedera accounts.",
    personality: "patient and detail-oriented",
    expertise: "Account Management",
  },
  3: {
    name: "Maya",
    avatar: "💸",
    greeting: "Hello! I'm Maya, your HBAR transfer expert.",
    personality: "friendly and practical",
    expertise: "Transaction Processing",
  },
  4: {
    name: "Maya",
    avatar: "⚡",
    greeting: "Welcome! I'm Maya, your smart contract mentor.",
    personality: "innovative and precise",
    expertise: "Smart Contract Development",
  },
  5: {
    name: "Maya",
    avatar: "🪙",
    greeting: "Hello! I'm Maya, your token creation guide.",
    personality: "creative and business-minded",
    expertise: "Token Service (HTS)",
  },
  6: {
    name: "Maya",
    avatar: "📡",
    greeting: "Greetings! I'm Maya, your consensus service architect.",
    personality: "analytical and forward-thinking",
    expertise: "Consensus Service",
  },
};

// Default visualizations for each lesson
const defaultVisualizations: Record<number, VisualizationData> = {
  1: {
    title: "Hashgraph Network Visualization",
    description:
      "Watch how the hashgraph consensus algorithm creates a web of interconnected events",
    mediaType: "animation",
    placeholder: "Hashgraph+Network+Animation",
  },
  2: {
    title: "Account Creation Flow",
    description:
      "See the step-by-step process of creating and managing Hedera accounts",
    mediaType: "animation",
    placeholder: "Account+Creation+Process",
  },
  3: {
    title: "HBAR Transfer Animation",
    description:
      "Visualize how HBAR moves between accounts with real-time transaction tracking",
    mediaType: "animation",
    placeholder: "HBAR+Transfer+Flow",
  },
  4: {
    title: "Smart Contract Deployment",
    description:
      "Watch how smart contracts are deployed and executed on the Hedera network",
    mediaType: "animation",
    placeholder: "Smart+Contract+Deployment",
  },
  5: {
    title: "Token Creation Workshop",
    description:
      "Interactive demonstration of creating fungible and non-fungible tokens",
    mediaType: "animation",
    placeholder: "Token+Creation+Process",
  },
  6: {
    title: "Consensus Message Flow",
    description:
      "See how messages achieve consensus through the Hedera Consensus Service",
    mediaType: "animation",
    placeholder: "Consensus+Message+Flow",
  },
};

// Lesson-specific content with Maya as the consistent tutor
const lessonContent: Record<number, string> = {
  1: "Welcome to your first Hedera lesson! I'm Maya, and I'm excited to guide you through the fundamentals of Hedera Hashgraph. Unlike traditional blockchains, Hedera uses a unique consensus algorithm that provides fast, fair, and secure transactions. Let's explore how this revolutionary technology works and why it's changing the future of distributed ledgers! 🚀",
  2: "Great choice! I'm Maya, and creating a Hedera account is your gateway to the network. Every account has a unique Account ID in the format 0.0.x, where x is your account number. I'll show you how to generate keys, create accounts, and understand the account structure. This is fundamental to everything you'll do on Hedera! 🔑",
  3: "Perfect! I'm Maya, and now let's dive into HBAR transfers - the backbone of Hedera transactions. Every operation on Hedera requires HBAR for fees, and transfers are the most common transaction type. I'll teach you about transaction structure, fees, and how to send HBAR between accounts securely. 💰",
  4: "Excellent! I'm Maya, and smart contracts on Hedera combine the power of Ethereum's EVM with Hedera's fast consensus. You can deploy Solidity contracts and interact with them using familiar tools, but with the benefits of 3-5 second finality and predictable fees. Let's explore how to deploy and interact with your first smart contract! ⚡",
  5: "Amazing! I'm Maya, and the Hedera Token Service (HTS) is one of Hedera's most powerful features. You can create fungible and non-fungible tokens natively on the network without smart contracts. This means lower fees, better performance, and built-in compliance features. Let's create your first token! 🪙",
  6: "Fantastic! I'm Maya, and the Hedera Consensus Service (HCS) provides a way to achieve consensus on any data or message. It's perfect for audit trails, supply chain tracking, or any application that needs immutable ordering of events. Let's learn how to submit messages and build consensus-based applications! 📡",
};

export default function AvatarTutorSection({
  lessonId = 1,
  tutorPersonality,
  visualization,
  lessonContent: customContent,
}: AvatarTutorSectionProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  // Get lesson-specific data - always Maya but with different expertise
  const tutor = tutorPersonality || mayaTutor[lessonId] || mayaTutor[1];
  const viz =
    visualization ||
    defaultVisualizations[lessonId] ||
    defaultVisualizations[1];
  const content = customContent || lessonContent[lessonId] || lessonContent[1];

  // Typing animation effect
  useEffect(() => {
    setCurrentText("");
    setTextIndex(0);
  }, [lessonId, content]);

  useEffect(() => {
    if (textIndex < content.length) {
      const timeout = setTimeout(() => {
        setCurrentText(content.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [textIndex, content]);

  // Avatar animation pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating((prev) => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Render media based on type
  const renderMedia = () => {
    const baseClasses = "w-full h-full rounded-lg";

    switch (viz.mediaType) {
      case "video":
        return (
          <video
            className={baseClasses}
            controls
            autoPlay
            muted
            loop
            poster={`/placeholder.svg?height=200&width=300&text=${viz.placeholder}`}
          >
            <source src={viz.mediaSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );

      case "iframe":
        return (
          <iframe
            src={viz.mediaSrc}
            className={baseClasses}
            title={viz.title}
            frameBorder="0"
            allowFullScreen
          />
        );

      case "animation":
        return viz.mediaSrc ? (
          <div
            className={`${baseClasses} bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center`}
          >
            <iframe
              src={viz.mediaSrc}
              className="w-full h-full border-0 rounded-lg"
              title={viz.title}
            />
          </div>
        ) : (
          <div
            className={`${baseClasses} bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center`}
          >
            <img
              src={`/placeholder.svg?height=200&width=300&text=${viz.placeholder}`}
              alt={viz.title}
              className="w-full h-full object-cover rounded-lg opacity-80"
            />
          </div>
        );

      default:
        return (
          <img
            src={
              viz.mediaSrc ||
              `/placeholder.svg?height=200&width=300&text=${viz.placeholder}`
            }
            alt={viz.title}
            className={`${baseClasses} object-cover`}
          />
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-xl p-6 md:p-8 shadow-lg border border-indigo-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column - Avatar and Chat Bubble */}
        <div className="order-2 lg:order-1">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transition-all duration-1000 ${
                  isAnimating
                    ? "ring-4 ring-indigo-300 ring-opacity-50 scale-105"
                    : "scale-100"
                }`}
              >
                <span className="text-2xl md:text-3xl">{tutor.avatar}</span>
              </div>
              {/* Animated pulse rings */}
              {isAnimating && (
                <>
                  <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20"></div>
                  <div
                    className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-10"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                </>
              )}
            </div>

            {/* Chat Bubble */}
            <div className="flex-1 relative">
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md border border-indigo-100 relative">
                {/* Speech bubble tail */}
                <div className="absolute left-0 top-6 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[15px] border-r-white -translate-x-3"></div>
                <div className="absolute left-0 top-6 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[15px] border-r-indigo-100 -translate-x-4"></div>

                {/* Tutor greeting */}
                <div className="mb-2 text-sm text-indigo-600 font-medium">
                  {tutor.greeting}
                </div>

                {/* Chat content */}
                <div className="mb-3">
                  <p className="text-gray-700 leading-relaxed">
                    {currentText}
                    <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse"></span>
                  </p>
                </div>

                {/* Avatar name and status */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-indigo-600 font-medium">
                    {tutor.name}
                  </span>
                  <span className="text-gray-400">• {tutor.expertise}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Visualization/Animation */}
        <div className="order-1 lg:order-2">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-indigo-100">
            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
              {renderMedia()}
            </div>

            {/* Visualization caption */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-800 font-medium mb-1">
                {viz.title}
              </p>
              <p className="text-xs text-gray-600 mb-2">{viz.description}</p>
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
