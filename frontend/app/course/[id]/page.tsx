"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState<any>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const courseRes = await axios.get(
      `http://localhost:5000/courses/${id}`
    );

    const lessonsRes = await axios.get(
      `http://localhost:5000/lessons/${id}`
    );

    const progressRes = await axios.get(
      `http://localhost:5000/progress/${id}`,
      { headers: { Authorization: token } }
    );

    setCourse(courseRes.data);
    setLessons(lessonsRes.data);
    setProgress(progressRes.data);
  };

  const markComplete = async (lessonId: string) => {
    await axios.post(
      "http://localhost:5000/progress",
      { courseId: id, lessonId },
      { headers: { Authorization: token } }
    );

    fetchData(); // refresh progress
  };

  const percent =
    progress && progress.total > 0
      ? (progress.completed / progress.total) * 100
      : 0;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-60 bg-orange-600 p-6 rounded-r-2xl">
        <p className="mb-4">Dashboard</p>
        <p className="mb-4">Courses</p>
        <p>Profile</p>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* TITLE */}
        <h1 className="text-5xl font-bold mb-4 uppercase">
          {course?.title}
        </h1>

        {/* PROGRESS */}
        <p className="mb-2">
          {progress?.completed}/{progress?.total} Completed
        </p>

        <div className="w-full bg-orange-200 h-4 rounded-full mb-6">
          <div
            className="bg-orange-600 h-4 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* LESSONS */}
        <div className="space-y-4">
          {lessons.map((lesson: any) => {
            const isDone =
              progress?.completedLessons?.includes(lesson._id);

            return (
              <div
                key={lesson._id}
                className="bg-orange-200 p-4 rounded-xl flex justify-between items-center"
              >
                <div>
                  <p className="text-sm">Lesson</p>
                  <h3 className="font-semibold">{lesson.title}</h3>
                  <p className="text-sm">study time: 1hr</p>
                </div>

                <button
                  onClick={() => markComplete(lesson._id)}
                  className={`w-10 h-10 rounded-full ${
                    isDone ? "bg-green-500" : "bg-orange-600"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}