"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonId = params.lessonId;
  const courseId = searchParams.get("courseId");

  const isNew = lessonId === "new";

  const [lesson, setLesson] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [content, setContent] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // ---------------- FETCH ----------------
  useEffect(() => {
    if (isNew) return;

    const fetchLesson = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/lessons/${lessonId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setLesson(res.data);
        setTitle(res.data.title);
        setType(res.data.type);
        setContent(res.data.content);

      } catch (err) {
        console.error(err);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (isNew) {
        await axios.post(
          `http://localhost:5000/lessons`,
          {
            title,
            type,
            content,
            courseId: Number(courseId),
          },
          config
        );
      } else {
        await axios.put(
          `http://localhost:5000/lessons/${lessonId}`,
          { title, type, content },
          config
        );
      }

      router.back();

    } catch (err) {
      console.error(err);
    }
  };

 return (
  <div className="min-h-screen bg-gray-100 p-6">

    <button onClick={() => router.back()} className="underline mb-4">
      ← Back
    </button>

    <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto">

      {/* LEFT: FORM */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <h1 className="text-xl font-bold">
          {isNew ? "Create Lesson" : "Edit Lesson"}
        </h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title"
          className="w-full px-4 py-2 bg-gray-100 rounded-lg"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 bg-gray-100 rounded-lg"
        >
          <option value="">Select type</option>
          <option value="text">Text</option>
          <option value="video">Video</option>
        </select>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Lesson content or video URL"
          className="w-full px-4 py-2 bg-gray-100 rounded-lg h-40 resize-none"
        />

        <button
          onClick={handleSave}
          className="bg-black text-white px-4 py-2 rounded-lg w-full"
        >
          {isNew ? "Create Lesson" : "Update Lesson"}
        </button>

      </div>

      {/* RIGHT: PREVIEW */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <h2 className="text-lg font-semibold">Preview</h2>

        {!title && !content && (
          <p className="text-gray-400 text-sm">
            Lesson preview will appear here
          </p>
        )}

        {title && (
          <h3 className="text-xl font-bold">
            {title}
          </h3>
        )}

        {type === "text" && (
          <p className="text-gray-800 whitespace-pre-wrap wrap-break-word">
            {content}
          </p>
        )}

        {type === "video" && content && (
          <iframe
            src={content}
            className="w-full h-64 rounded"
            allowFullScreen
          />
        )}

      </div>

    </div>
  </div>
);
}