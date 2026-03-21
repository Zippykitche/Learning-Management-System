"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/audit", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">

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

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">

        <h1 className="text-xl font-semibold mb-6 mt-6">
          Activity Logs
        </h1>

        {logs.length === 0 && (
          <p className="text-gray-500">No activity yet</p>
        )}

        <div className="space-y-4">
          {logs.map((log: any) => (
            <div
              key={log._id}
              className="bg-white p-4 rounded-xl shadow space-y-2"
            >
              {/* ACTION */}
              <div className="flex justify-between items-center">
                <p className="font-semibold text-black">
                  {log.action}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>

              {/* USER */}
              <div className="text-sm text-gray-700">
                <p>
                  <span className="font-medium">User:</span>{" "}
                  {log.user?.name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">
                  {log.user?.email}
                </p>
              </div>

              {/* METADATA */}
              {log.metadata && (
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <span className="font-medium">Details:</span>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}