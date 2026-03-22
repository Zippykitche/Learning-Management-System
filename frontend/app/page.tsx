"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL;

  // 🔐 Save auth data (centralized)
  const saveAuth = (token: string, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    document.cookie = `token=${token}; path=/`;
    document.cookie = `role=${role}; path=/`;
  };

  const clearInputs = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  // REGISTER
  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      clearInputs();
      setIsLogin(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      const { token, user } = data;

      // 🔥 Save auth
      saveAuth(token, user.role);

      clearInputs();

      // 🔥 Role-based redirect
      if (user.role === "admin") {
        router.push("/admin/adminDashboard");
      } else {
        router.push("/learner/learnerDashboard");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#d6a89c]">

      {/* LEFT SIDE */}
      <div className="hidden md:flex items-center justify-center bg-[#f2f2f2]">
        <Image
          src="/images/exam.gif"
          alt="illustration"
          width={500}
          height={500}
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center p-10">
        <div className="w-[320px] space-y-6 text-center">

          <h2 className="text-2xl font-semibold">
            {isLogin ? "Login" : "Create Account"}
          </h2>

           {/* name */}
           {!isLogin && (
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {/* Email */}
          <Input
            placeholder="Email address"
            className="rounded-full bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <Input
            type="password"
            placeholder="Password"
            className="rounded-full bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Confirm Password */}
          {!isLogin && (
            <Input
              type="password"
              placeholder="Confirm password"
              className="rounded-full bg-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Button */}
          <Button
            onClick={isLogin ? handleLogin : handleRegister}
            className="w-full rounded-full bg-black text-white hover:bg-[#8e4533]"
            disabled={
              loading ||
              !email ||
              !password ||
              (!isLogin && !confirmPassword)
            }
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Create Account"}
          </Button>

          {/* Toggle */}
          <p className="text-sm">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                >
                  Register
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                >
                  Login
                </span>
              </>
            )}
          </p>

        </div>
      </div>
    </div>
  );
}