"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------- LOAD TOKEN ----------------
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // ---------------- FETCH USER ----------------
  const fetchUser = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:5000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = res.data.user || res.data;

      setUser(userData);
      setName(userData.name || "");
      setEmail(userData.email || "");

    } catch (err: any) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE PROFILE ----------------
  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.put(
        "http://localhost:5000/users/update",
        { name, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Profile updated successfully!");
      // ✅ redirect to dashboard
    setTimeout(() => {
      router.push("/learner/learnerDashboard");
    }, 1000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/");
  };

  // ---------------- EFFECT ----------------
  useEffect(() => {
    if (token === null) return;

    if (!token) {
      router.push("/");
      return;
    }

    fetchUser(token);
  }, [token]);

  if (token === null || loading) {
    return <p className="p-6">Loading profile...</p>;
  }

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">

      <div className="bg-white p-8 rounded-2xl shadow-md w-[350px] space-y-5">

        <h2 className="text-xl font-semibold text-center">My Profile</h2>

        {/* NAME */}
        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 rounded-lg bg-gray-100"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded-lg bg-gray-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ERROR */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* SUCCESS */}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        {/* SAVE BUTTON */}
        <button
          onClick={handleUpdate}
          disabled={saving || !name || !email}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {/* BACK TO DASHBOARD */}
        <button
          onClick={() => router.push("/learner/learnerDashboard")}
          className="w-full text-sm underline"
        >
          ← Back to Dashboard
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full text-sm text-red-500 underline"
        >
          Logout
        </button>

      </div>
    </div>
  );
}