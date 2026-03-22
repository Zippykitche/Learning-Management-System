"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

type Course = {
  id: number;
  _id: string;
  title: string;
  description: string;
  category?: string;
};

type ProgressType = {
  courseId: string;
  completed: number;
  total: number;
};

export default function LearnerDashboard() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, ProgressType>>({});
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL;

  const categories = [
  "all",
  ...Array.from(
    new Set(
      courses
        .map((c) => c.category?.toLowerCase())
        .filter((cat): cat is string => Boolean(cat)) 
    )
  )
];

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const fetchUser = async (token: string) => {
    const res = await axios.get("${API}/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data.user || res.data);
  };

  const fetchCourses = async (token: string) => {
    try {
      setLoading(true);

      const res = await axios.get("${API}/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("COURSES FROM API:", res.data);
      setCourses(res.data);

      const progressRequests = res.data.map((course: Course) =>
        axios
          .get(`${API}/progress/${course._id || course.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch((err) => {
            console.warn(`Progress fetch failed for ${course.title} (${course._id || course.id}):`, err.response?.data || err.message);
            return null;
          })
      );

      const responses = await Promise.all(progressRequests);

      const map: Record<string, ProgressType> = {};

      responses.forEach((res) => {
        if (!res?.data) return;
        const cId = res.data.courseId || res.data.id;
        if (cId) map[String(cId)] = res.data;
      });

      console.log("PROGRESS MAP:", map);
      setProgress(map);
    } catch (err: any) {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUser(token);
    fetchCourses(token);
  }, [token]);

  const filteredCourses = courses
    .filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    )
     .filter((c) => {
    // CATEGORY FILTER
    if (selectedCategory !== "all") {
      return c.category?.toLowerCase() === selectedCategory;
    }
    return true;
  })
    .filter((c) => {
      const prog = progress[c._id || String(c.id)];

      if (filter === "completed") return prog && prog.completed === prog.total;
      if (filter === "pending") return !prog || prog.completed < prog.total;

      return true;
    });

  if (!token) return <p className="p-6">Checking session...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 p-6">
        <div className="sticky top-6 bg-[#efbab0c7] p-6 rounded-2xl shadow-sm h-130">

          <h2 className="mb-8 text-lg font-semibold">Learner Panel</h2>

          <p
            className={`mb-4 cursor-pointer ${filter === "all" ? "font-bold underline" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Courses
          </p>

          <p
            className={`mb-4 cursor-pointer ${filter === "completed" ? "font-bold underline" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </p>

          <p
            className={`mb-4 cursor-pointer ${filter === "pending" ? "font-bold underline" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </p>

          <p
            className="mb-4 cursor-pointer hover:underline"
            onClick={() => router.push("/learner/profile")}
          >
            Profile
          </p>

          <button
            onClick={handleLogout}
            className="mt-6 text-sm underline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user?.name || "Learner"}
            </h1>
            <p className="text-gray-500 text-sm">
              Track your course progress
            </p>
          </div>

          <input
            type="text"
            placeholder="Search courses..."
            className="px-4 py-2 rounded-lg bg-white border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* STATES */}
        {loading && <p>Loading courses...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* CATEGORIES */}
<div className="mb-6">
  <h2 className="text-sm text-gray-500 mb-2">categories</h2>

  <div className="flex gap-6 flex-wrap">
    {categories.map((cat) => (
      <p
        key={cat}
        onClick={() => setSelectedCategory(cat)}
        className={`cursor-pointer capitalize ${
          selectedCategory === cat
            ? "font-bold text-black"
            : "text-gray-500"
        }`}
      >
        {cat}
      </p>
    ))}
  </div>
</div>

    <h2 className="text-lg font-semibold mb-4">Browse Courses</h2>

        {/* COURSE GRID */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const prog = progress[course._id || String(course.id)];

              return (
                <Link href={`/learner/course/${course._id || course.id}`} key={course._id || course.id}>
                  <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-[#efbab04e] transition cursor-pointer flex flex-col justify-between">

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        {course.title}
                      </h3>

                      {prog ? (
                        <p className="text-sm text-gray-600">
                          {prog.completed}/{prog.total} lessons completed
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Not started
                        </p>
                      )}

                      {/* BADGE */}
                      <span className="inline-block text-xs bg-[#efbab04e] px-2 py-1 rounded mt-2">
                        {prog ? `${prog.completed}/${prog.total}` : "0 progress"}
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}