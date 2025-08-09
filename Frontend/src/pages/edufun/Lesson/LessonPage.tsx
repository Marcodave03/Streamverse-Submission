  // import { useParams, useNavigate } from "react-router-dom";
  // import { Link } from "react-router-dom";
  // import LessonDetailPage from "../../../components/edufun/lesson-detail-page";
  // import { lessons } from "../../edufun/Lesson/constant/lesson";
  // import type { LessonData } from "./constant/lesson";


  // export default function LessonPage() {
  //   const { id } = useParams<{ id: string }>();
  //   const navigate = useNavigate();

  

  //   const currentLessonId = parseInt(id || "1", 10);
  //   const lesson = lessons[currentLessonId - 1];

  //   const lessonData: LessonData = {
  //     ...lesson,
  //     content: {
  //       sections: lesson.content.sections.map((s) => ({
  //         heading: s.title,
  //         paragraphs: [s.content],
  //       })),
  //     },
  //   };

  //   if (!lesson) {
  //     return (
  //       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
  //         <div className="text-center">
  //           <h1 className="text-2xl font-bold text-gray-800 mb-4">
  //             Lesson Not Found
  //           </h1>
  //           <Link
  //             to="/chat/edufun"
  //             className="text-indigo-600 hover:text-indigo-800"
  //           >
  //             Return to Lesson List
  //           </Link>
  //         </div>
  //       </div>
  //     );
  //   }

  //   const handleLessonSelect = (lessonId: number) => {
  //     navigate(`/chat/edufun/lesson/${lessonId}`);
  //   };

  //   const handleBack = () => {
  //     navigate("/chat/edufun");
  //   };

  //   return (
  //     <LessonDetailPage
  //   lesson={
  //     {
  //       id: lesson.id,
  //       title: lesson.title,
  //       description: lesson.description,
  //       difficulty: lesson.difficulty,
  //       duration: lesson.duration,
  //       objectives: lesson.objectives,
  //       tutorIntro: lesson.tutorIntro,
  //       sandboxCode: lesson.sandboxCode,
  //       content: {
  //         sections: lesson.content.sections.map((s) => ({
  //           heading: s.title,
  //           paragraphs: [s.content],
  //         })),
  //       },
  //     } as LessonData // ✅ fix TS2322 with assertion
  //   }
  //   currentLessonId={currentLessonId}
  //   onBack={handleBack}
  //   onLessonChange={handleLessonSelect}
  // />
  //   );
  // }

  import { useParams, useNavigate, Link } from "react-router-dom";
import LessonDetailPage from "../../../components/edufun/lesson-detail-page";
import { lessons } from "../../edufun/Lesson/constant/lesson";
import type { LessonData } from "./constant/lesson";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentLessonId = parseInt(id || "1", 10);
  const lesson = lessons[currentLessonId - 1];

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Lesson Not Found
          </h1>
          <Link
            to="/chat/edufun"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Return to Lesson List
          </Link>
        </div>
      </div>
    );
  }

  const lessonData: LessonData = {
    ...lesson,
    content: {
      sections: lesson.content.sections.map((s) => ({
        heading: s.title,
        paragraphs: [s.content],
      })),
    },
  };

  const handleLessonSelect = (lessonId: number) => {
    navigate(`/chat/edufun/lesson/${lessonId}`);
  };

  const handleBack = () => {
    navigate("/chat/edufun");
  };

  return (
    <LessonDetailPage
      lesson={lessonData}
      currentLessonId={currentLessonId}
      onBack={handleBack}
      onLessonChange={handleLessonSelect}
    />
  );
}
