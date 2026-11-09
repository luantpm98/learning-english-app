import { useState } from "react";
import { type Page, type UserAccount } from "../App";

type Props = {
  current: Page;
  onChange: (p: Page) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  user?: UserAccount | null;
  onLogin?: (account: UserAccount) => void;
  onLogout?: () => void;
};

const nav: { id: Page; icon: string; label: string }[] = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "videos", icon: "▶", label: "Video Library" },
  { id: "vocabulary", icon: "◈", label: "Vocabulary" },
  { id: "phrases", icon: "❝", label: "Phrases" },
  { id: "review", icon: "◷", label: "Daily Review" },
  { id: "reflex", icon: "⚡", label: "Reflex Training" },
];

export default function Sidebar({ current, onChange, theme, onToggleTheme, user, onLogin, onLogout }: Props) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        onLogin?.({
          id: data.id,
          username: data.username,
          name: data.name || data.username,
          role: data.role || "ADMIN",
        });
        setShowAuthModal(false);
        setLoading(false);
        return;
      }
    } catch {}

    // Fallback offline verification for admin/luantpm98
    if ((username === "admin" || username === "luantpm98") && password === "123456") {
      onLogin?.({
        id: username === "admin" ? 1 : 2,
        username,
        name: username === "admin" ? "Administrator (Full Access)" : "Trần Luân (Admin)",
        role: "ADMIN",
      });
      setShowAuthModal(false);
    } else {
      setAuthError("Sai tên đăng nhập hoặc mật khẩu (admin / 123456)");
    }
    setLoading(false);
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--card)]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-[var(--primary-foreground)] text-sm font-black" style={{ fontFamily: "Outfit,sans-serif" }}>EN</span>
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--foreground)]" style={{ fontFamily: "Outfit,sans-serif" }}>ShadowFlow</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mono">English Mastery</div>
            </div>
          </div>
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {nav.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                active
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-green-500/10"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account & Streak */}
      <div className="p-4 border-t border-[var(--border)] flex flex-col gap-3">
        {user ? (
          <div className="bg-[var(--secondary)] rounded-lg p-3 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--foreground)] truncate">{user.username}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--primary)]/20 text-[var(--primary)]">
                    {user.role}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">{user.name}</div>
              </div>
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10"
              >
                ⎋
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full py-2 px-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold hover:opacity-90"
          >
            Đăng nhập tài khoản
          </button>
        )}

        <div className="bg-[var(--muted)] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--muted-foreground)]">Learning streak</span>
            <span className="text-xs text-orange-400">🔥 7 days</span>
          </div>
          <div className="w-full bg-[var(--secondary)] rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-yellow-300" style={{ width: "70%" }} />
          </div>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-1.5 mono">140 / 200 XP today</div>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-[var(--foreground)] mb-1">Đăng nhập</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">Tài khoản Admin mặc định: <span className="mono text-[var(--primary)]">admin</span> / <span className="mono text-[var(--primary)]">123456</span></p>
            {authError && <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg mb-3">{authError}</div>}
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-semibold hover:opacity-90"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
