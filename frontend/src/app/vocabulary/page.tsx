"use client";
import { getUserKey, API_URL, getSrsMap, speakEnglish, lookupWordDictionary, saveSrsWord } from "../../utils/storage";
import { BUILTIN_VOCAB_SETS } from "../../utils/curatedData";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function VocabularySetsPage() {
  const [sets, setSets] = useState<any[]>(BUILTIN_VOCAB_SETS);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [srsStats, setSrsStats] = useState({ total: 0, due: 0, mastered: 0 });

  // Quick Add Custom Word Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [customWord, setCustomWord] = useState("");
  const [customPhonetic, setCustomPhonetic] = useState("");
  const [customMeaning, setCustomMeaning] = useState("");
  const [customExample, setCustomExample] = useState("");
  const [autoFilling, setAutoFilling] = useState(false);

  useEffect(() => {
    refreshLocalCounts();
    fetchSets();
  }, []);

  const refreshLocalCounts = () => {
    const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    setSavedCount(saved.length);

    const srsMap = getSrsMap();
    const items = Object.values(srsMap);
    const now = Date.now();
    setSrsStats({
      total: items.length,
      due: items.filter((i) => i.nextReview <= now).length,
      mastered: items.filter((i) => i.level >= 4).length,
    });
  };

  const fetchSets = async () => {
    try {
      const res = await axios.get(`${API_URL}/vocabulary-sets`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Combine built-in sets with backend sets without duplicates
        const backendSets = res.data;
        const merged = [...BUILTIN_VOCAB_SETS];
        for (const bSet of backendSets) {
          const exists = merged.some(
            (m) => m.name.toLowerCase().includes("oxford 1000") && bSet.name.toLowerCase().includes("oxford 1000")
          );
          if (!exists && !merged.some((m) => m.name === bSet.name)) {
            merged.push(bSet);
          }
        }
        setSets(merged);
      }
    } catch (e) {
      // Fallback already populated with BUILTIN_VOCAB_SETS
    }
  };

  const handleAutoFillDictionary = async () => {
    if (!customWord.trim()) return;
    setAutoFilling(true);
    try {
      const [dict, transRes] = await Promise.all([
        lookupWordDictionary(customWord),
        axios.post(`${API_URL}/videos/translate`, { text: customWord.trim() }).catch(() => ({ data: { text: "" } })),
      ]);
      setCustomPhonetic(dict.phonetic || `/${customWord.trim().toLowerCase()}/`);
      if (transRes.data?.text && !customMeaning) {
        setCustomMeaning(transRes.data.text);
      }
      if (dict.example && !customExample) {
        setCustomExample(dict.example);
      } else if (dict.definitionEn && !customExample) {
        setCustomExample(dict.definitionEn);
      }
    } finally {
      setAutoFilling(false);
    }
  };

  const handleSaveCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWord.trim() || !customMeaning.trim()) return;
    const savedWords = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    const newWord = {
      id: Date.now(),
      word: customWord.trim(),
      phonetic: customPhonetic.trim() || `/${customWord.trim().toLowerCase()}/`,
      translation: customMeaning.trim(),
      definition: customExample.trim() || `Example: We use "${customWord.trim()}" in daily conversation.`,
    };
    savedWords.unshift(newWord);
    localStorage.setItem(getUserKey("savedWords"), JSON.stringify(savedWords));
    saveSrsWord(newWord, "good");

    setCustomWord("");
    setCustomPhonetic("");
    setCustomMeaning("");
    setCustomExample("");
    setShowAddModal(false);
    refreshLocalCounts();
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 h-full flex flex-col gap-6 overflow-y-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Hệ Thống Học Từ Vựng Thông Minh</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Phương pháp đa giác quan (Flashcard 3D · Trắc nghiệm · Nghe chính tả · Ghép từ tốc độ · Lặp lại ngắt quãng SRS)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-sm flex items-center gap-2"
          >
            <span>➕</span> Thêm từ vựng mới
          </button>
          <Link
            href="/review"
            className="bg-amber-500 text-black px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-sm flex items-center gap-2"
          >
            <span>🔥</span> Ôn tập SRS ({srsStats.due})
          </Link>
        </div>
      </div>

      {/* SRS OVERVIEW BANNER */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Đang học trong SRS</span>
          <span className="text-xl md:text-3xl font-extrabold text-primary mt-1">{srsStats.total} từ</span>
        </div>
        <div className="flex flex-col border-x border-border px-3 md:px-6">
          <span className="text-xs text-muted-foreground font-medium">Cần ôn tập hôm nay</span>
          <span className="text-xl md:text-3xl font-extrabold text-amber-500 mt-1">{srsStats.due} từ</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Đã thuộc lòng (Mastered)</span>
          <span className="text-xl md:text-3xl font-extrabold text-emerald-500 mt-1">{srsStats.mastered} từ</span>
        </div>
      </div>

      {/* SETS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* SAVED / PERSONAL WORDS CARD */}
        <Link
          href="/vocabulary/saved"
          className="group bg-card border-2 border-primary/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col cursor-pointer hover:-translate-y-1 duration-300"
        >
          <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-500">⭐</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  Cá nhân hóa
                </span>
                <h2 className="text-white font-bold text-xl leading-tight mt-2">Sổ Tay Từ Vựng Của Tôi</h2>
              </div>
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between bg-primary/5">
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              Các từ vựng bạn tự thêm hoặc bấm lưu khi xem phụ đề video và các bộ từ.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-xl w-full">
              <span>📚 {savedCount} từ đã lưu</span>
              <span>Học ngay →</span>
            </div>
          </div>
        </Link>

        {/* ALL VOCABULARY SETS */}
        {sets.map((set) => {
          const wordCount = set._count?.words || set.words?.length || 0;
          return (
            <Link
              href={`/vocabulary/${set.id}`}
              key={set.id}
              className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col cursor-pointer hover:-translate-y-1 duration-300"
            >
              <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                {set.thumbnail ? (
                  <img
                    src={set.thumbnail}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={set.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📘</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2.5 py-0.5 rounded-full">
                      {set.badge || "Chuẩn Quốc Tế"}
                    </span>
                    <h2 className="text-white font-bold text-lg md:text-xl leading-tight mt-2 line-clamp-2">
                      {set.name}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{set.description}</p>
                <div className="flex items-center justify-between text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-xl w-full">
                  <span>📖 {wordCount} từ vựng</span>
                  <span>Luyện 4 chế độ →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ADD CUSTOM WORD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">➕ Thêm Từ Vựng Vào Sổ Tay</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCustomWord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Từ hoặc cụm từ Tiếng Anh *
                </label>
                <div className="flex gap-2">
                  <input
                    required
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    onBlur={() => {
                      if (customWord && !customPhonetic) handleAutoFillDictionary();
                    }}
                    placeholder="VD: collaborate, figure out..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAutoFillDictionary}
                    disabled={autoFilling || !customWord.trim()}
                    className="px-3 py-2.5 rounded-xl bg-secondary text-xs font-bold hover:opacity-90 disabled:opacity-50 shrink-0"
                  >
                    {autoFilling ? "⏳..." : "🪄 Tự điền IPA & Ví dụ"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Phiên âm IPA</label>
                  <input
                    value={customPhonetic}
                    onChange={(e) => setCustomPhonetic(e.target.value)}
                    placeholder="/kəˈlæbəreɪt/"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:border-primary font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Nghĩa Tiếng Việt *
                  </label>
                  <input
                    required
                    value={customMeaning}
                    onChange={(e) => setCustomMeaning(e.target.value)}
                    placeholder="hợp tác, phối hợp"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Câu ví dụ ngữ cảnh giao tiếp
                </label>
                <textarea
                  rows={2}
                  value={customExample}
                  onChange={(e) => setCustomExample(e.target.value)}
                  placeholder="VD: Our team will collaborate closely on this project."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-secondary font-semibold text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90"
                >
                  Lưu & Đưa vào SRS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
