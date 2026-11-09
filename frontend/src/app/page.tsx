"use client";
import { API_URL, getSrsMap, speakEnglish } from "../utils/storage";
import { BUILTIN_VOCAB_SETS, ESSENTIAL_PHRASES, ROLEPLAY_SCENARIOS } from "../utils/curatedData";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [user, setUser] = useState<any>(null);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };
  const [data, setData] = useState<any>({
    streak: 1,
    recentVideo: null,
    recentWords: BUILTIN_VOCAB_SETS[0].words.slice(0, 5),
    reviewWords: BUILTIN_VOCAB_SETS[1].words.slice(0, 5),
    phrases: ESSENTIAL_PHRASES.slice(0, 5),
  });
  const [srsDueCount, setSrsDueCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/auth");
    } else {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      // Load cached dashboard immediately (0ms wait)
      const cached = localStorage.getItem(`dashboard_cache_${parsed.id}`);
      if (cached) {
        try {
          setData(JSON.parse(cached));
        } catch {}
      }

      const srsItems = Object.values(getSrsMap());
      setSrsDueCount(srsItems.filter((i) => i.nextReview <= Date.now()).length || 10);

      // Sync fresh dashboard from backend in background
      fetchDashboard(parsed.id);
    }
  }, [router]);

  const fetchDashboard = async (id: number) => {
    try {
      const res = await axios.get(`${API_URL}/users/${id}/dashboard`);
      if (res.data) {
        const merged = {
          ...res.data,
          recentWords:
            res.data.recentWords?.length > 0 ? res.data.recentWords : BUILTIN_VOCAB_SETS[0].words.slice(0, 5),
          reviewWords:
            res.data.reviewWords?.length > 0 ? res.data.reviewWords : BUILTIN_VOCAB_SETS[1].words.slice(0, 5),
          phrases: res.data.phrases?.length > 0 ? res.data.phrases : ESSENTIAL_PHRASES.slice(0, 5),
        };
        setData(merged);
        localStorage.setItem(`dashboard_cache_${id}`, JSON.stringify(merged));
      }
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 h-full flex flex-col overflow-y-auto gap-6">
      {/* MOBILE TOP BAR FOR THEME & ACCOUNT */}
      <div className="flex md:hidden items-center justify-between bg-card border border-border px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
            E
          </div>
          <span className="font-bold text-sm">EngMaster Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-1.5 rounded-lg bg-secondary text-xs">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg"
          >
            Thoát
          </button>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary to-blue-600 text-white p-5 md:p-8 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Lộ trình tiếng Anh giao tiếp toàn diện
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mt-2 mb-1">
            Chào {user.name || user.username}! 👋
          </h1>
          <p className="opacity-90 text-sm md:text-base">
            Hôm nay bạn có <b>{srsDueCount} từ vựng</b> đến hạn ôn SRS và 5 tình huống hội thoại thực tế.
          </p>
        </div>
        <div className="flex sm:flex-col items-center justify-between bg-white/20 p-3.5 md:p-4 rounded-2xl text-center min-w-[110px] backdrop-blur-sm">
          <div className="text-2xl md:text-4xl font-extrabold">{Math.max(1, data.streak || 1)} 🔥</div>
          <div className="text-xs md:text-sm font-semibold">Ngày học liên tiếp</div>
        </div>
      </div>

      {/* QUICK ACTION PILLS FOR MOBILE & DESKTOP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/vocabulary/101/learn"
          className="bg-card border border-border hover:border-primary p-4 rounded-2xl flex flex-col gap-1 shadow-sm transition-all"
        >
          <span className="text-2xl">🃏</span>
          <span className="font-bold text-sm">Học từ giao tiếp</span>
          <span className="text-xs text-muted-foreground">Flashcard & Quiz</span>
        </Link>
        <Link
          href="/phrases"
          className="bg-card border border-border hover:border-primary p-4 rounded-2xl flex flex-col gap-1 shadow-sm transition-all"
        >
          <span className="text-2xl">🎭</span>
          <span className="font-bold text-sm">Đóng vai Roleplay</span>
          <span className="text-xs text-muted-foreground">{ROLEPLAY_SCENARIOS.length} tình huống</span>
        </Link>
        <Link
          href="/reflex"
          className="bg-card border border-border hover:border-primary p-4 rounded-2xl flex flex-col gap-1 shadow-sm transition-all"
        >
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-sm">Luyện phản xạ 5s</span>
          <span className="text-xs text-muted-foreground">Bật câu tức thì</span>
        </Link>
        <Link
          href="/review"
          className="bg-card border border-border hover:border-primary p-4 rounded-2xl flex flex-col gap-1 shadow-sm transition-all"
        >
          <span className="text-2xl">🧠</span>
          <span className="font-bold text-sm">Ôn tập SRS ({srsDueCount})</span>
          <span className="text-xs text-muted-foreground">Nhớ từ vĩnh viễn</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT VIDEO */}
        <div className="bg-card p-5 md:p-6 rounded-3xl border border-border flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">▶ Tiếp tục xem Video</h2>
            <Link href="/videos" className="text-xs font-bold text-primary hover:underline">
              Thư viện →
            </Link>
          </div>
          {data.recentVideo ? (
            <Link
              href={`/videos/${data.recentVideo.id}`}
              className="group relative rounded-2xl overflow-hidden aspect-video bg-black block"
            >
              <img
                src={`https://img.youtube.com/vi/${data.recentVideo.youtubeId}/mqdefault.jpg`}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                alt="video"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/85 to-transparent">
                <span className="text-white font-bold text-sm line-clamp-2">{data.recentVideo.title}</span>
              </div>
            </Link>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl p-6">
              <p className="mb-3 text-center text-sm">Luyện nghe phụ đề song ngữ, Shadowing & Chép chính tả từng câu.</p>
              <Link
                href="/videos"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm"
              >
                Khám phá Video
              </Link>
            </div>
          )}
        </div>

        {/* RECENT WORDS */}
        <div className="bg-card p-5 md:p-6 rounded-3xl border border-border flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">📖 Từ vựng trọng tâm</h2>
            <Link href="/vocabulary" className="text-xs text-primary font-bold hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {(data.recentWords || []).slice(0, 5).map((w: any) => (
              <div
                key={w.id || w.word}
                onClick={() => speakEnglish(w.word)}
                className="flex justify-between items-center p-3 bg-secondary/40 rounded-xl border border-border cursor-pointer hover:border-primary/40"
              >
                <div>
                  <span className="font-bold text-primary">{w.word}</span>
                  {w.translation && <span className="text-xs text-muted-foreground ml-2">— {w.translation}</span>}
                </div>
                <span className="text-xs">🔊</span>
              </div>
            ))}
          </div>
        </div>

        {/* REVIEW WORDS */}
        <div className="bg-card p-5 md:p-6 rounded-3xl border border-border flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">🧠 Cần ôn tập hôm nay</h2>
            <Link href="/review" className="text-xs text-primary font-bold hover:underline">
              Ôn SRS →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {(data.reviewWords || []).slice(0, 5).map((w: any) => (
              <div
                key={w.id || w.word}
                onClick={() => speakEnglish(w.word)}
                className="flex justify-between items-center p-3 bg-secondary/40 rounded-xl border border-border cursor-pointer hover:border-primary/40"
              >
                <div className="font-bold text-primary">{w.word}</div>
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Đến hạn ôn
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
