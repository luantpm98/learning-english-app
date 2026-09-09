import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import VideosPage from "./pages/VideosPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import VocabularyPage from "./pages/VocabularyPage";
import PhrasesPage from "./pages/PhrasesPage";
import ReviewPage from "./pages/ReviewPage";
import ReflexPage from "./pages/ReflexPage";

export type Page = "dashboard" | "videos" | "video-detail" | "vocabulary" | "phrases" | "review" | "reflex";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const navigate = (p: Page, id?: string) => {
    if (p === "video-detail" && id) setSelectedVideoId(id);
    setPage(p);
  };

  const sidebarPage: Page = page === "video-detail" ? "videos" : page;

  return (
    <div className="h-full flex bg-[var(--background)]">
      <Sidebar current={sidebarPage} onChange={(p) => navigate(p)} theme={theme} onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {page === "dashboard" && <DashboardPage navigate={navigate} />}
        {page === "videos" && <VideosPage navigate={navigate} />}
        {page === "video-detail" && selectedVideoId && (
          <VideoDetailPage videoId={selectedVideoId} navigate={navigate} />
        )}
        {page === "vocabulary" && <VocabularyPage />}
        {page === "phrases" && <PhrasesPage />}
        {page === "review" && <ReviewPage />}
        {page === "reflex" && <ReflexPage />}
      </main>
    </div>
  );
}
