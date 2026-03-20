"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function LearnerDashboard() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState<Record<number, ProgressType>>({});
  const [search, setSearch] = useState("");

  type ProgressType = {
  completed: number;
  total: number;
  completedLessons?: string[];
};

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get("http://localhost:5000/courses", {
      headers: { Authorization: token },
    });

    setCourses(res.data);

    const progressMap: any = {};

    for (let course of res.data) {
      const prog = await axios.get(
        `http://localhost:5000/progress/${course.id}`,
        { headers: { Authorization: token } }
      );

      progressMap[course.id] = prog.data;
    }

    setProgress(progressMap);
  };

  const filteredCourses = courses.filter((c: any) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white-100">
      
      {/* SIDEBAR */}
      <div className="w-60 bg-[#d6a89c] text-black p-6 rounded-r-2xl">
        <h2 className="mb-6 font-semibold">Dashboard</h2>
        <p className="mb-4">My Courses</p>
        <p className="mb-4">Completed</p>
        <p>Profile</p>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-[#d6a89c] px-4 py-2 rounded-lg">
            <h2 className="font-semibold">Hello Zippy!</h2>
            <p className="text-sm">It's good to see you again</p>
          </div>

          <input
            type="text"
            placeholder="search course"
            className="px-4 py-2 rounded-lg bg-[#d6a89c]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-4 text-sm">
          <p className="font-semibold">All courses</p>
          <p>Newest</p>
          <p>Most popular</p>
        </div>

        {/* COURSES GRID */}
        <div className="grid grid-cols-4 gap-6">
          {filteredCourses.map((course: any) => {
            const prog = progress[course.id];

            return (
              <div
                key={course.id}
                className="bg-[#d6a89c] rounded-2xl p-4 h-40 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold">{course.title}</h3>

                  {prog && (
                    <p className="text-sm mt-2">
                      {prog.completed}/{prog.total} lessons completed
                    </p>
                  )}
                </div>

                <a
                  href={`/course/${course.id}`}
                  className="text-sm flex justify-end items-center gap-1"
                >
                  View course →
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}