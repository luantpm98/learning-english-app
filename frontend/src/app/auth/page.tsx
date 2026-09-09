"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}`}${endpoint}`, { username, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      router.push("/");
      window.dispatchEvent(new Event("storage"));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to authenticate");
    }
  };

  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl border border-border shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center text-primary">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {isLogin ? "Log in to continue learning" : "Sign up to start your journey"}
        </p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:border-primary focus:outline-none"
              required
            />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground font-bold text-lg py-3 rounded-xl mt-4 hover:opacity-90">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
