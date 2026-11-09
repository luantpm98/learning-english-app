"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "../utils/storage";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [pathname]);

  // Background keep-alive ping every 5 minutes while app is open so Render stays warm
  useEffect(() => {
    const ping = () => {
      fetch(`${API_URL}/health`).catch(() => {});
    };
    ping();
    const id = setInterval(ping, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (pathname === "/auth") return null;

  const links = [
    { href: "/", label: "Tổng quan", shortLabel: "Home", icon: "📊" },
    { href: "/videos", label: "Thư viện Video", shortLabel: "Video", icon: "🎬" },
    { href: "/vocabulary", label: "Từ vựng 4 Chế độ", shortLabel: "Từ vựng", icon: "🗂️" },
    { href: "/phrases", label: "Giao tiếp & Roleplay", shortLabel: "Giao tiếp", icon: "🎭" },
    { href: "/reflex", label: "Phản xạ câu", shortLabel: "Phản xạ", icon: "⚡" },
    { href: "/review", label: "Ôn tập SRS", shortLabel: "Ôn SRS", icon: "🧠" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth");
  };

  return (
    <>
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col justify-between py-6 px-4 shrink-0 transition-all z-30">
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30 shrink-0">
              E
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">EngMaster Pro</span>
              <span className="text-[11px] text-muted-foreground">Giao tiếp & Phản xạ</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {links.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-sm ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          {user && (
            <div className="p-3 bg-secondary/50 rounded-xl flex items-center justify-between border border-border">
              <div className="truncate pr-2">
                <div className="text-xs text-muted-foreground">Tài khoản</div>
                <div className="font-bold text-sm truncate text-primary">
                  {user.name || user.username}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors shrink-0 font-bold"
                title="Đăng xuất"
              >
                Thoát
              </button>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all text-sm font-medium"
          >
            <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>{theme === "dark" ? "Giao diện Sáng" : "Giao diện Tối"}</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (Shown on Phones & Small Tablets < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-1 shadow-2xl">
        {links.map((link) => {
          const isActive =
            pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[52px] ${
                isActive ? "text-primary font-extrabold scale-105" : "text-muted-foreground"
              }`}
            >
              <span className="text-lg leading-none">{link.icon}</span>
              <span className="text-[10px] mt-1 leading-none whitespace-nowrap">{link.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
