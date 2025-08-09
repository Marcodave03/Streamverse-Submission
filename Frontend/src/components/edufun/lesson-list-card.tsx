import { Link } from "react-router-dom";
import { BookOpen, Clock, Star } from "lucide-react"

interface Lesson {
  id: number
  title: string
  description: string
  difficulty: string
}

interface LessonListCardProps {
  lessons: Lesson[]
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800"
    case "intermediate":
      return "bg-yellow-100 text-yellow-800"
    case "advanced":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function LessonListCard({ lessons }: LessonListCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
        >
          <div className="p-8">
            {/* Difficulty Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
              <div className="flex items-center text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">15-30 min</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">{lesson.title}</h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">{lesson.description}</p>

            {/* Features */}
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>Interactive</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                <span>Hands-on</span>
              </div>
            </div>

            {/* Start Learning Button */}
           <Link to={`/chat/edufun/lesson/${lesson.id}`}>
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
              Start Learning
            </button>
          </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
