"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  lessonCount?: number;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchCourses();
  }, [token]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category) return;

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/courses/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:5000/courses", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({ title: "", description: "", category: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCourses();

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (course: Course) => {
    setForm(course);
    setEditingId(course.id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 p-6">
        <div className="sticky top-6 bg-[#efbab0c7] p-6 rounded-2xl shadow-sm h-130">

          <h2
            className="mb-8 text-lg font-semibold cursor-pointer"
            onClick={() => router.push("/admin/adminDashboard")}
          >
            Admin Panel
          </h2>

          <p
            className="mb-4 cursor-pointer hover:underline"
            onClick={() => router.push("/admin/activityLogs")}
          >
            Activity Logs
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
          <h1 className="text-2xl font-bold">Courses</h1>

          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm({ title: "", description: "", category: "" });
            }}
            className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            + New Course
          </button>
        </div>

        {/* FORM MODAL STYLE */}
        {showForm && (
          <div className="mb-10 flex justify-center">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg space-y-4">

              <h2 className="font-semibold text-lg">
                {editingId ? "Edit Course" : "Create Course"}
              </h2>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Course title"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg"
              />

              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg"
              />

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Category"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="bg-black text-white px-4 py-2 rounded-lg w-full"
                >
                  Save
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  className="border px-4 py-2 rounded-lg w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COURSE GRID */}
        <div className="grid grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/admin/manageLessons/${course.id}`)}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-[#efbab04e] transition cursor-pointer flex flex-col justify-between "                    
            >
              <div className="space-y-2">

                <h3 className="font-semibold text-lg">
                  {course.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {course.description}
                </p>

                <p className="text-xs text-gray-400 italic">
                  {course.category}
                </p>

                {/* BADGE */}
                <span className="inline-block text-xs bg-[#efbab04e] text-black px-2 py-1 rounded mt-2">
                  {course.lessonCount || 0} lessons
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-4 text-sm">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(course);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(course.id);
                  }}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}