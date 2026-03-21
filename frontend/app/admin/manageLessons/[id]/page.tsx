"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export default function ManageLessons() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("");
  const [formContent, setFormContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
 

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // ---------------- FETCH ----------------
  const fetchData = async () => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const [courseRes, lessonsRes] = await Promise.all([
      axios.get(`http://localhost:5000/courses/${id}`, config),
      axios.get(`http://localhost:5000/lessons/courses/${id}/lessons`, config),
    ]);

    setCourse(courseRes.data);
    setLessons(lessonsRes.data);

  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  // ---------------- CREATE / UPDATE ----------------
  const handleSubmit = async () => {
  if (!formTitle || !formType || !formContent) return;

  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    if (editingId) {
      await axios.put(
        `http://localhost:5000/lessons/${editingId}`,
        {
          title: formTitle,
          type: formType,
          content: formContent,
        },
        config
      );
    } else {
      await axios.post(
        "http://localhost:5000/lessons",
        {
          title: formTitle,
          type: formType,
          content: formContent,
          courseId: Number(id),
        },
        config
      );
    }

    // reset
    setFormTitle("");
    setFormType("");
    setFormContent("");
    setEditingId(null);

    fetchData();

  } catch (err) {
    console.error(err);
  }
};
  // ---------------- DELETE ----------------
  const handleDelete = async (lessonId: string) => {
    try {
      await axios.delete(
        `http://localhost:5000/lessons/${lessonId}`,
        {
    headers: { Authorization: `Bearer ${token}` },
  }
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- EDIT ----------------
  const handleEdit = (lesson: any) => {
  setFormTitle(lesson.title);
  setFormType(lesson.type || "");
  setFormContent(lesson.content || "");
  setEditingId(lesson._id);
};

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
        <div className="w-56 p-6">
      <div className="sticky top-6 bg-[#efbab0c7] p-4 rounded-2xl h-130">
        <h2
          className="mb-6 font-semibold cursor-pointer"
          onClick={() => router.push("/admin/adminDashboard")}
        >
          ← Back
        </h2>

        <button onClick={handleLogout} className="mt-6 underline">
          Logout
        </button>
      </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 ml-20 p-6 overflow-y-auto">
        <div className="w-full max-w-3xl p-4">

          {/* TITLE */}
          <h1 className="text-4xl font-bold mb-6 text-center">
            {course?.title || "Manage Lessons"}
          </h1>

          {/* ADD BUTTON */}
          <div className="mb-6 flex justify-start">
            <button
              onClick={() => router.push(`/admin/lesson/new?courseId=${id}`)}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              + Add Lesson
            </button>
          </div>

          {/* LESSONS */}
<div className="space-y-4">
  {lessons.length === 0 && (
    <p className="text-center">No lessons yet</p>
  )}

  {lessons.map((lesson: any, index: number) => (
    <div
      key={lesson._id}
      onClick={() => router.push(`/admin/lesson/${lesson._id}`)}
      className="bg-white p-4 rounded-xl flex justify-between items-center cursor-pointer shadow-sm hover:shadow-[#efbab04e] transition" 
    >
      {/* LEFT SIDE */}
          <div>
            <p className="text-sm">Lesson {index + 1}</p>
            <h3 className="font-semibold">{lesson.title}</h3>
          </div>

          {/* RIGHT SIDE (BUTTONS) */}
          <div className="flex gap-3 text-sm">
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                handleDelete(lesson._id);
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
    </div>
  );
}