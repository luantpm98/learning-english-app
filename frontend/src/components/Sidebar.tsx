'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const nav = [
  { id: "/", icon: "⊞", label: "Dashboard" },
  { id: "/videos", icon: "▶", label: "Video Library" },
  { id: "/vocabulary", icon: "◈", label: "Vocabulary" },
  { id: "/phrases", icon: "❝", label: "Phrases" },
  { id: "/review", icon: "◷", label: "Daily Review" },
  { id: "/reflex", icon: "⚡", label: "Reflex Training" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Sync user from localstorage
  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [pathname]); // also check on route change

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth");
  };

  if (pathname === "/auth") return null; // Don't show sidebar on auth page

  return (
    <aside className="w-20 md:w-64 bg-card border-r border-border flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border">
        <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
          E
        </div>
        <span className="ml-3 font-bold text-xl hidden md:block">EngApp</span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {nav.map((item) => {
          const isActive = item.id === "/" ? pathname === "/" : pathname.startsWith(item.id);

          return (
            <Link
              key={item.id}
              href={item.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="text-xl w-6 text-center">{item.icon}</span>
              <span className="font-medium hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border flex flex-col gap-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <span className="text-xl w-6 text-center">{theme === "dark" ? "☀" : "☾"}</span>
          <span className="font-medium hidden md:block">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-md text-red-500 hover:bg-red-50 transition-colors"
          >
            <span className="text-xl w-6 text-center">⎋</span>
            <span className="font-medium hidden md:block">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
