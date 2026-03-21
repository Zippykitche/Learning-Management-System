"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function LessonPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const lessonId = params.lessonId;
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/lessons/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLesson(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading lesson...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 p-6">
        <div className="bg-[#efbab0c7] p-6 rounded-2xl shadow-sm h-130">
          <h2
            className="cursor-pointer font-semibold mb-4"
            onClick={() =>
              router.push(`/learner/course/${courseId}`)
            }
          >
            ← Back to Course
          </h2>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/");
            }}
            className="underline text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">

        <h1 className="text-3xl font-bold mb-4">
          {lesson?.title}
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">

          {/* CONTENT */}
          <p className="text-gray-700 whitespace-pre-line">
            {lesson?.content}
          </p>

        </div>
      </div>
    </div>
  );
}