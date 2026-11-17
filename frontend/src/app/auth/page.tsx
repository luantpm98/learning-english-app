"use client";
import { API_URL } from "../../utils/storage";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const router = useRouter();

  const submitAuth = async (targetUser: string, targetPass: string, isLoginMode: boolean) => {
    setError("");
    setLoading(true);
    setStatusMsg("Đang kết nối máy chủ...");

    const slowTimer = setTimeout(() => {
      setStatusMsg("Máy chủ đang khởi động lại (Render), vui lòng đợi thêm vài giây...");
    }, 4000);

    const endpoint = isLoginMode ? "/auth/login" : "/auth/register";
    const normalizedUser = targetUser.trim().toLowerCase();

    const attempt = async () => {
      return axios.post(
        `${API_URL}${endpoint}`,
        {
          username: normalizedUser,
          password: targetPass,
          ...(isLoginMode ? {} : { name: name.trim() || normalizedUser }),
        },
        { timeout: 65000 }
      );
    };

    try {
      let res;
      try {
        res = await attempt();
      } catch (firstErr: any) {
        // Retry once automatically if server was waking up from cold start (502/503/network)
        if (!firstErr.response || firstErr.response.status >= 500) {
          setStatusMsg("Đang thử kết nối lại máy chủ...");
          await new Promise((r) => setTimeout(r, 2000));
          res = await attempt();
        } else {
          throw firstErr;
        }
      }

      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("storage"));
      router.push("/");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) setError(msg.join(", "));
      else if (typeof msg === "string") setError(msg);
      else setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau vài giây!");
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setStatusMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAuth(username, password, isLogin);
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card p-6 md:p-8 rounded-3xl border border-border shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-extrabold text-2xl flex items-center justify-center shadow-lg mb-3">
            E
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-center text-primary">
            {isLogin ? "Đăng Nhập" : "Tạo Tài Khoản Mới"}
          </h1>
          <p className="text-muted-foreground text-center text-sm mt-1">
            {isLogin
              ? "Đăng nhập đồng bộ trên mọi thiết bị (Điện thoại & Máy tính)"
              : "Đăng ký tài khoản để lưu tiến độ học giao tiếp"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-500 p-3.5 rounded-xl mb-5 text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        {loading && statusMsg && (
          <div className="bg-primary/10 border border-primary/30 text-primary p-3 rounded-xl mb-5 text-xs font-semibold flex items-center gap-2">
            <span className="animate-spin inline-block">⏳</span>
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Minh Anh"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:border-primary focus:outline-none text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
              Tên đăng nhập (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="VD: admin hoặc luantpm98"
              className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:border-primary focus:outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
              Mật khẩu (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:border-primary focus:outline-none text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl mt-2 hover:opacity-90 disabled:opacity-60 transition-all shadow-md"
          >
            {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập ngay" : "Đăng ký tài khoản"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản rồi? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
