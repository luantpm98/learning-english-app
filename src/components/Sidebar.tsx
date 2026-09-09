import { type Page } from "../App";

type Props = {
  current: Page;
  onChange: (p: Page) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

const nav: { id: Page; icon: string; label: string }[] = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "videos", icon: "▶", label: "Video Library" },
  { id: "vocabulary", icon: "◈", label: "Vocabulary" },
  { id: "phrases", icon: "❝", label: "Phrases" },
  { id: "review", icon: "◷", label: "Daily Review" },
  { id: "reflex", icon: "⚡", label: "Reflex Training" },
];

export default function Sidebar({ current, onChange, theme, onToggleTheme }: Props) {
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

      {/* Streak */}
      <div className="p-4 border-t border-[var(--border)]">
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
    </aside>
  );
}
