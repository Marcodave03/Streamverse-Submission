"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Circle,
  Menu,
  X,
  ChevronRight,
  Clock,
  Play,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  current?: boolean;
}

interface Course {
  title: string;
  description: string;
  totalLessons: number;
  lessons: Lesson[];
}

interface LessonNavigationSidebarProps {
  course: Course;
  currentLessonId: number;
  onLessonSelect: (lessonId: number) => void;
  className?: string;
}

// Sample course data matching the existing lessons
const sampleCourse: Course = {
  title: "Hedera Fundamentals",
  description: "Master the basics of Hedera Network development",
  totalLessons: 6,
  lessons: [
    {
      id: 1,
      title: "Introduction to Hedera Hashgraph",
      duration: "15 min",
    },
    {
      id: 2,
      title: "Creating Your First Hedera Account",
      duration: "20 min",
    },
    {
      id: 3,
      title: "HBAR Transfers and Transactions",
      duration: "25 min",
    },
    {
      id: 4,
      title: "Smart Contracts on Hedera",
      duration: "35 min",
    },
    {
      id: 5,
      title: "Hedera Token Service (HTS)",
      duration: "30 min",
    },
    {
      id: 6,
      title: "Consensus Service Integration",
      duration: "40 min",
    },
  ],
};

export default function LessonNavigationSidebar({
  course = sampleCourse,
  currentLessonId = 3,
  onLessonSelect,
  className = "",
}: LessonNavigationSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false); // Close mobile drawer on desktop
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close drawer when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.getElementById("lesson-sidebar");
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen]);

  const handleLessonClick = (lessonId: number) => {
    onLessonSelect(lessonId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Mobile Toggle Button
  const MobileToggle = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
    >
      {isOpen ? (
        <X className="w-5 h-5 text-gray-600" />
      ) : (
        <Menu className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );

  // Sidebar Content
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Course Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800 truncate">
              {course.title}
            </h2>
            <p className="text-sm text-gray-600 truncate">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 px-2">
            Course Lessons
          </h3>
          <div className="space-y-1">
            {course.lessons.map((lesson) => {
              const isCurrentLesson = lesson.id === currentLessonId;

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                    isCurrentLesson
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-sm"
                      : "hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isCurrentLesson ? (
                        <Play className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          Lesson {lesson.id}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                      <h4
                        className={`font-medium leading-tight truncate ${
                          isCurrentLesson
                            ? "text-indigo-700"
                            : "text-gray-800 group-hover:text-indigo-600"
                        }`}
                      >
                        {lesson.title}
                      </h4>
                    </div>

                    {/* Arrow for current lesson */}
                    {isCurrentLesson && (
                      <ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>

                  {/* Current lesson indicator */}
                  {isCurrentLesson && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium">
                      Currently studying
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            {course.totalLessons} lessons available
          </p>
          <div className="text-xs text-gray-400">
            Choose any lesson to start learning! 📚
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <MobileToggle />

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200" />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed left-0 top-0 h-full w-80 z-30 ${className}`}
      >
        <div className="h-full bg-white rounded-r-2xl shadow-lg border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        id="lesson-sidebar"
        className={`lg:hidden fixed left-0 top-0 h-full w-80 bg-white z-40 transform transition-transform duration-300 ease-in-out rounded-r-2xl shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
