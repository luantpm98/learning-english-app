import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import VideosPage from "./pages/VideosPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import VocabularyPage from "./pages/VocabularyPage";
import PhrasesPage from "./pages/PhrasesPage";
import ReviewPage from "./pages/ReviewPage";
import ReflexPage from "./pages/ReflexPage";
import { defaultVideos, defaultChannels, type Video, type Channel } from "./data";

export type Page = "dashboard" | "videos" | "video-detail" | "vocabulary" | "phrases" | "review" | "reflex";

export type UserAccount = {
  id: number;
  username: string;
  name: string;
  role: "ADMIN" | "USER";
};

const DEFAULT_ADMIN: UserAccount = {
  id: 1,
  username: "admin",
  name: "Administrator (Full Access)",
  role: "ADMIN",
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem("user", JSON.stringify(DEFAULT_ADMIN));
    return DEFAULT_ADMIN;
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem("sf_videos");
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultVideos;
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem("sf_channels");
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultChannels;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("sf_videos", JSON.stringify(videos));
    } catch {}
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem("sf_channels", JSON.stringify(channels));
    } catch {}
  }, [channels]);

  const navigate = (p: Page, id?: string) => {
    if (p === "video-detail" && id) setSelectedVideoId(id);
    setPage(p);
  };

  const handleLogin = (account: UserAccount) => {
    setUser(account);
    localStorage.setItem("user", JSON.stringify(account));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const sidebarPage: Page = page === "video-detail" ? "videos" : page;

  return (
    <div className="h-full flex bg-[var(--background)]">
      <Sidebar
        current={sidebarPage}
        onChange={(p) => navigate(p)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {page === "dashboard" && <DashboardPage navigate={navigate} videos={videos} />}
        {page === "videos" && (
          <VideosPage
            navigate={navigate}
            videos={videos}
            setVideos={setVideos}
            channels={channels}
            setChannels={setChannels}
          />
        )}
        {page === "video-detail" && selectedVideoId && (
          <VideoDetailPage
            videoId={selectedVideoId}
            navigate={navigate}
            videos={videos}
            setVideos={setVideos}
          />
        )}
        {page === "vocabulary" && <VocabularyPage />}
        {page === "phrases" && <PhrasesPage />}
        {page === "review" && <ReviewPage />}
        {page === "reflex" && <ReflexPage />}
      </main>
    </div>
  );
}
