"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

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
            {isLogin ? "login" : "Create Account"}
          </h2>

          {/* Email */}
          <Input
            placeholder="Email address"
            className="rounded-full bg-white"
          />

          {/* Password */}
          <Input
            type="password"
            placeholder="Password"
            className="rounded-full bg-white"
          />

          {/* Confirm Password */}
          {!isLogin && (
            <Input
              type="password"
              placeholder="Confirm password"
              className="rounded-full bg-white"
            />
          )}

          {/* Button */}
          <Button className="w-full rounded-full bg-black text-white hover:bg-gray-800">
            {isLogin ? "Login" : "Create Account"}
          </Button>

          {/* Toggle */}
          <p className="text-sm">
  {isLogin ? (
    <>
      Don't have an account?{" "}
      <span
        className="underline cursor-pointer"
        onClick={() => setIsLogin(false)}
      >
        Register
      </span>
    </>
  ) : (
    <>
      Already have an account?{" "}
      <span
        className="underline cursor-pointer"
        onClick={() => setIsLogin(true)}
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