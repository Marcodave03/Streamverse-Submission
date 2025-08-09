import { useState, useRef } from "react";
import {
  ChevronDown,
  Play,
  BookOpen,
  Clock,
  Users,
  HelpCircle,
} from "lucide-react";
import AvatarTutorSection from "./avatar-tutor-section";
import SandboxViewer from "./sandbox-viewer";
import LessonNavigationSidebar from "./lesson-navigation-sidebar";
import { GPTHelpSidebar } from "./gpt-help-sidebar";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  current?: boolean;
}

interface Course {
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  lessons: Lesson[];
}

interface LessonData {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  objectives: string[];
  content: {
    sections: Array<{
      heading: string;
      paragraphs: string[];
    }>;
  };
  tutorIntro: string;
  sandboxCode: string;
}

interface LessonDetailPageProps {
  lesson?: LessonData;
  currentLessonId?: number;
  onBack?: () => void;
  onLessonChange?: (lessonId: number) => void;
}

// Sample lesson data
const sampleLesson: LessonData = {
  id: 4,
  title: "Smart Contracts on Hedera",
  description:
    "Learn to deploy and interact with smart contracts using Hedera's EVM-compatible environment",
  difficulty: "Advanced",
  duration: "35 min",
  objectives: [
    "Understand Hedera's smart contract capabilities",
    "Deploy your first smart contract",
    "Interact with contracts using the SDK",
    "Handle contract events and errors",
  ],
  content: {
    sections: [
      {
        heading: "Hedera Smart Contracts Overview",
        paragraphs: [
          "Hedera supports smart contracts through its EVM-compatible environment, allowing developers to deploy Solidity contracts with the performance and security benefits of the Hashgraph consensus algorithm.",
          "Unlike traditional blockchain networks, Hedera smart contracts benefit from fast finality (3-5 seconds), predictable fees, and high throughput while maintaining full compatibility with Ethereum tooling.",
          "Smart contracts on Hedera are executed by network nodes and their state changes are recorded on the distributed ledger, ensuring transparency and immutability.",
        ],
      },
      {
        heading: "Deploying Your First Contract",
        paragraphs: [
          "To deploy a smart contract on Hedera, you'll use the ContractCreateTransaction from the Hedera SDK. This transaction includes your compiled bytecode and constructor parameters.",
          "The deployment process involves submitting the transaction to the network, paying the required fees in HBAR, and receiving a contract ID that you'll use for future interactions.",
          "Once deployed, your contract receives a unique Contract ID in the format 0.0.x, similar to account IDs, which serves as its permanent address on the network.",
        ],
      },
      {
        heading: "Interacting with Contracts",
        paragraphs: [
          "Contract interactions are performed using ContractCallQuery for read operations and ContractExecuteTransaction for state-changing operations.",
          "The Hedera SDK provides convenient methods to encode function calls and decode responses, making it easy to work with your smart contracts from any supported programming language.",
          "All contract interactions are subject to Hedera's fee structure, with predictable costs that make it easier to build sustainable applications.",
        ],
      },
    ],
  },
  tutorIntro:
    "Welcome to smart contracts on Hedera! This is where things get really exciting. We'll learn how to deploy and interact with smart contracts using Hedera's EVM-compatible environment. You'll discover how Hedera combines the familiarity of Ethereum development with the performance advantages of Hashgraph consensus.",
  sandboxCode: `// Deploying a Smart Contract on Hedera
const { 
  Client, 
  ContractCreateTransaction, 
  ContractExecuteTransaction,
  ContractCallQuery,
  Hbar 
} = require("@hashgraph/sdk");

async function deployAndCallContract() {
  // Create client for testnet
  const client = Client.forTestnet();
  
  // Sample contract bytecode (Hello World contract)
  const contractBytecode = "0x608060405234801561001057600080fd5b50..."; // Truncated for example
  
  try {
    // Deploy the contract
    console.log("🚀 Deploying smart contract...");
    
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecode(contractBytecode)
      .setGas(100000)
      .setConstructorParameters(); // Add parameters if needed
    
    const contractCreateResponse = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateResponse.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;
    
    console.log("✅ Contract deployed successfully!");
    console.log("Contract ID:", contractId.toString());
    
    // Call a contract function
    console.log("\\n📞 Calling contract function...");
    
    const contractCallTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(50000)
      .setFunction("setMessage", ["Hello, Hedera!"]);
    
    const contractCallResponse = await contractCallTx.execute(client);
    const contractCallReceipt = await contractCallResponse.getReceipt(client);
    
    console.log("✅ Contract function called successfully!");
    console.log("Transaction status:", contractCallReceipt.status.toString());
    
    // Query contract state
    console.log("\\n🔍 Querying contract state...");
    
    const contractQuery = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(30000)
      .setFunction("getMessage");
    
    const contractQueryResult = await contractQuery.execute(client);
    console.log("📋 Contract response:", contractQueryResult.getString(0));
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  
  client.close();
}

deployAndCallContract();`,
};

export default function LessonDetailPage({
  lesson = sampleLesson,
  currentLessonId = 4,
  onBack,
  onLessonChange,
}: LessonDetailPageProps) {
  const [showSandbox, setShowSandbox] = useState(false);
  const sandboxRef = useRef<HTMLDivElement>(null);

  const scrollToSandbox = () => {
    setShowSandbox(true);
    setTimeout(() => {
      sandboxRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleLessonSelect = (lessonId: number) => {
    onLessonChange?.(lessonId);
    // Reset sandbox state when switching lessons
    setShowSandbox(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const sampleCourse: Course = {
    title: "Hedera Fundamentals",
    description: "Master the basics of Hedera Network development",
    totalLessons: 6,
    completedLessons: 2,
    lessons: [
      {
        id: 1,
        title: "Introduction to Hedera Hashgraph",
        duration: "15 min",
        completed: true,
      },
      {
        id: 2,
        title: "Creating Your First Hedera Account",
        duration: "20 min",
        completed: true,
      },
      {
        id: 3,
        title: "HBAR Transfers and Transactions",
        duration: "25 min",
        completed: false,
      },
      {
        id: 4,
        title: "Smart Contracts on Hedera",
        duration: "35 min",
        completed: false,
      },
      {
        id: 5,
        title: "Hedera Token Service (HTS)",
        duration: "30 min",
        completed: false,
      },
      {
        id: 6,
        title: "Consensus Service Integration",
        duration: "40 min",
        completed: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation Sidebar */}
      <LessonNavigationSidebar
        course={sampleCourse} // or your real course data array
        currentLessonId={currentLessonId}
        onLessonSelect={handleLessonSelect}
      />

      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="mb-8">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors mb-6 lg:hidden"
              >
                ← Back to Lessons
              </button>
            )}

            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {lesson.title}
                  </h1>
                  <p className="text-lg text-gray-600">{lesson.description}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(
                      lesson.difficulty
                    )}`}
                  >
                    {lesson.difficulty}
                  </span>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {lesson.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  What You'll Learn
                </h3>
                <ul className="space-y-2">
                  {lesson.objectives.map((objective, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-indigo-700"
                    >
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Avatar Tutor Section */}
          <div className="mb-8">
            <AvatarTutorSection
              lessonId={lesson.id}
              lessonContent={lesson.tutorIntro}
            />
          </div>

          {/* Animated Lesson Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                  <Play className="w-5 h-5" />
                </div>
                Interactive Visualization
              </h2>

              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-8 text-center">
                <div className="max-w-md mx-auto">
                  <img
                    src="/placeholder.svg?height=300&width=400&text=Smart+Contract+Deployment"
                    alt="Smart Contract Visualization"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <div className="flex justify-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <p className="text-gray-600">
                    Watch how smart contracts are deployed and executed on the
                    Hedera network
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Text Content */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Lesson Content
                </h2>

                <div className="prose prose-lg max-w-none">
                  {lesson.content.sections.map((section, index) => (
                    <div key={index} className="mb-8 last:mb-0">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                        {section.heading}
                      </h3>
                      <div className="space-y-4">
                        {section.paragraphs.map((paragraph, pIndex) => (
                          <p
                            key={pIndex}
                            className="text-gray-700 leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Sandbox Button */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 md:p-8 border-t border-gray-100">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Ready to Practice?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Now that you understand the concepts, let's put them into
                    practice with hands-on coding!
                  </p>
                  <button
                    onClick={scrollToSandbox}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Play className="w-5 h-5" />
                    Start Sandbox
                    <ChevronDown className="w-5 h-5 animate-bounce" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Viewer */}
          {showSandbox && (
            <div ref={sandboxRef} className="mb-8">
              <SandboxViewer
                initialCode={lesson.sandboxCode}
                title="Hands-On Practice"
              />
            </div>
          )}

          {/* GPT Help Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                  <HelpCircle className="w-5 h-5" />
                </div>
                Need Help? Ask AI Assistant
              </h2>
              <GPTHelpSidebar />
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-5 h-5" />
                <span>Join thousands of developers learning Hedera</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleLessonSelect(currentLessonId - 1)}
                  disabled={currentLessonId <= 1}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous Lesson
                </button>
                <button
                  onClick={() => handleLessonSelect(currentLessonId + 1)}
                  disabled={currentLessonId >= 8}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
