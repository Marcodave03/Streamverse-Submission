"use client"

import { BookOpen, Code, Coins, Network, Users, FileText } from "lucide-react"

const lessons = [
  {
    id: 1,
    title: "Introduction to Hedera Hashgraph",
    description:
      "Learn the fundamentals of Hedera's unique consensus algorithm and how it differs from traditional blockchain technology.",
    icon: Network,
    difficulty: "Beginner",
    duration: "15 min",
  },
  {
    id: 2,
    title: "Creating Your First Hedera Account",
    description:
      "Step-by-step guide to setting up a Hedera account, understanding account IDs, and managing cryptographic keys.",
    icon: Users,
    difficulty: "Beginner",
    duration: "20 min",
  },
  {
    id: 3,
    title: "HBAR Transfers and Transactions",
    description:
      "Master the basics of sending HBAR cryptocurrency, understanding transaction fees, and monitoring transaction status.",
    icon: Coins,
    difficulty: "Intermediate",
    duration: "25 min",
  },
  {
    id: 4,
    title: "Smart Contracts on Hedera",
    description: "Deploy and interact with smart contracts using Hedera's EVM-compatible environment and Solidity.",
    icon: Code,
    difficulty: "Advanced",
    duration: "35 min",
  },
  {
    id: 5,
    title: "Hedera Token Service (HTS)",
    description: "Create and manage fungible and non-fungible tokens natively on Hedera without smart contracts.",
    icon: FileText,
    difficulty: "Intermediate",
    duration: "30 min",
  },
  {
    id: 6,
    title: "Consensus Service Integration",
    description: "Build applications using Hedera's Consensus Service for immutable messaging and audit trails.",
    icon: BookOpen,
    difficulty: "Advanced",
    duration: "40 min",
  },
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-700 border-green-200"
    case "Intermediate":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "Advanced":
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

interface LessonListProps {
  onLessonSelect?: (lessonId: number) => void
}

export default function LessonList({ onLessonSelect }: LessonListProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Choose a Hedera Lesson to Begin
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Interactive tutorials designed to help you master the Hedera Network step by step
        </p>
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {lessons.map((lesson) => {
          const IconComponent = lesson.icon
          return (
            <div
              key={lesson.id}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(lesson.difficulty)}`}
                    >
                      {lesson.difficulty}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{lesson.duration}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                  {lesson.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-6">{lesson.description}</p>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => onLessonSelect?.(lesson.id)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Start Learning
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="text-center mt-16">
        <p className="text-gray-500">More lessons coming soon! Master the fundamentals first.</p>
      </div>
    </div>
  )
}
