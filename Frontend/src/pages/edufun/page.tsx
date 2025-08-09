import React from "react";
import { LessonListCard } from "../../components/edufun/lesson-list-card";

const lessons = [
  {
    id: 1,
    title: "Introduction to Hedera Hashgraph",
    description:
      "Learn the fundamentals of Hedera's consensus algorithm and how it differs from traditional blockchain.",
    difficulty: "Beginner",
  },
  {
    id: 2,
    title: "Creating Your First Hedera Account",
    description: "Step-by-step guide to setting up a Hedera account and understanding account IDs.",
    difficulty: "Beginner",
  },
  {
    id: 3,
    title: "HBAR Transfers and Transactions",
    description: "Master the basics of sending HBAR and understanding transaction fees.",
    difficulty: "Intermediate",
  },
  {
    id: 4,
    title: "Smart Contracts on Hedera",
    description: "Deploy and interact with smart contracts using Hedera's EVM-compatible environment.",
    difficulty: "Advanced",
  },
  {
    id: 5,
    title: "Hedera Token Service (HTS)",
    description: "Create and manage fungible and non-fungible tokens natively on Hedera.",
    difficulty: "Intermediate",
  },
  {
    id: 6,
    title: "Consensus Service Integration",
    description: "Build applications using Hedera's Consensus Service for immutable messaging.",
    difficulty: "Advanced",
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            EduFun Sandbox
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn Hedera Network through interactive tutorials and hands-on coding experiences
          </p>
        </div>

        {/* Lesson Selection */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Choose a Hedera Lesson to Begin</h2>
          <LessonListCard lessons={lessons} />
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 mt-16">
          <p>Start your journey into the future of distributed ledger technology</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
