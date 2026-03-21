"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export default function CourseDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // ---------------- AUTH + LOAD ----------------
  useEffect(() => {
  if (!token || !id) return; 

  fetchData();
}, [token, id]);

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const courseRes = await axios.get(`http://localhost:5000/courses/${id}`, config).catch(e => { throw new Error(`Course fetch failed: ${e.response?.data?.message || e.message}`) });
      const lessonsRes = await axios.get(`http://localhost:5000/lessons/courses/${id}/lessons`, config).catch(e => { throw new Error(`Lessons fetch failed: ${e.response?.data?.message || e.message}`) });
      const progressRes = await axios.get(`http://localhost:5000/progress/${id}`, config).catch(e => { throw new Error(`Progress fetch failed: ${e.response?.data?.message || e.message}`) });

      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setProgress(progressRes.data);

    } catch (err: any) {
    }
  };

  // ---------------- TOGGLE COMPLETE ----------------
  const toggleLesson = async (lessonId: string) => {
    if (updating === lessonId) return;

    setUpdating(lessonId);

    try {
      const courseIdParam = isNaN(Number(id)) ? id : Number(id);

      await axios.post(
        "http://localhost:5000/progress/toggle",
        { courseId: courseIdParam, lessonId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
//....
      setProgress((prev: any) => {
  if (!prev) return prev;

  const lessonStr = String(lessonId);

  const alreadyDone = prev.completedLessons
    ?.map(String)
    .includes(lessonStr);

  let updatedLessons;

  if (alreadyDone) {
    updatedLessons = prev.completedLessons.filter(
      (id: any) => String(id) !== lessonStr
    );
  } else {
    updatedLessons = [...prev.completedLessons, lessonStr];
  }

  return {
    ...prev,
    completed: updatedLessons.length,
    completedLessons: updatedLessons,
  };
});

    } catch (err) {
      console.error("TOGGLE ERROR:", err);
    } finally {
      setUpdating(null);
    }
  };

  // ---------------- PROGRESS ----------------
  const percent =
    progress && progress.total > 0
      ? (progress.completed / progress.total) * 100
      : 0;

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/");
  };

  // ---------------- UI ----------------
  return (
  <div className="min-h-screen bg-gray-100 flex">

    {/* SIDEBAR  */}
    <div className="sticky top-6 bg-[#efbab0c7] p-6 rounded-2xl shadow-sm h-130">

      <h2
        className="mb-6 font-semibold cursor-pointer"
        onClick={() => router.push("/learner/learnerDashboard")}
      >
        ← Back to Dashboard
      </h2>

      <button onClick={handleLogout} className="mt-6 underline">
        Logout
      </button>
    </div>

    {/* MAIN CONTENT (CENTERED) */}
    <div className="flex-1 flex justify-center">
      <div className="w-full max-w-3xl p-6">

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-4 text-center">
          {course?.title || "Course"}
        </h1>

        {/* PROGRESS */}
        <p className="mb-2 text-center">
          {progress?.completed || 0}/{progress?.total || 0} Completed
        </p>

        <div className="flex gap-2 mb-6">
  {lessons.map((lesson: any, index: number) => {
    const lessonId = lesson._id?.toString();
    console.log("LESSON CLICK ID:", lessonId);

    const isDone =
      progress?.completedLessons
        ?.map(String)
        .includes(lessonId);

    return (
      <div
        key={lessonId}
        className={`flex-1 h-4 rounded-md transition-all duration-300 ${
          isDone ? "bg-green-500" : "bg-gray-300"
        }`}
      />
    );
  })}
</div>

        {/* LESSONS */}
        <div className="space-y-4">
          {lessons.length === 0 && (
            <p className="text-center">No lessons found for this course</p>
          )}

          {lessons.map((lesson: any, index: number) => {
            const lessonId = lesson._id?.toString();

            const isDone =
              progress?.completedLessons
                ?.map(String)
                .includes(lessonId);

            return (
              <div
              key={lessonId}
              onClick={() =>
                router.push(`/learner/lessonPage/${lessonId}?courseId=${id}`)
              }
              className="bg-[#d6a89c] p-4 rounded-xl flex justify-between items-center cursor-pointer hover:opacity-90"
            >
                <div>
                  <p className="text-sm">Lesson {index + 1}</p>
                  <h3 className="font-semibold">{lesson.title}</h3>
                  <p className="text-sm">study time: 1hr</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLesson(lessonId);
                  }}
                  disabled={updating === lessonId}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDone ? "bg-green-500" : "bg-[#f9ebe8]"
                  }`}
                >
                  {isDone ? "✓" : ""}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>

  </div>
);
}