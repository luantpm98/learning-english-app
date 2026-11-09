"use client";
import { getUserKey, API_URL, speakEnglish, getSrsMap, saveSrsWord, lookupWordDictionary } from "../../../utils/storage";
import { BUILTIN_VOCAB_SETS } from "../../../utils/curatedData";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VocabularySetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;

  const [set, setSet] = useState<any>(null);
  const [savedWordIds, setSavedWordIds] = useState<number[]>([]);
  const [srsMap, setSrsMap] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "learning" | "mastered" | "saved">("all");
  const [page, setPage] = useState(1);
  const [enrichingId, setEnrichingId] = useState<number | null>(null);
  const PAGE_SIZE = 48;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    setSavedWordIds(saved.map((w: any) => w.id));
    setSrsMap(getSrsMap());
  }, []);

  useEffect(() => {
    if (!setId) return;
    const builtIn = BUILTIN_VOCAB_SETS.find((s) => String(s.id) === String(setId));
    if (builtIn) {
      setSet(builtIn);
    }

    axios
      .get(`${API_URL}/vocabulary-sets/${setId}`)
      .then(async (res) => {
        const data = res.data;
        setSet(data);

        // Background batch translate for first 120 words if untranslated
        const untranslated = (data.words || []).filter((w: any) => !w.translation).slice(0, 120);
        if (untranslated.length > 0) {
          try {
            const texts = untranslated.map((w: any) => w.word);
            const tRes = await axios.post(`${API_URL}/videos/translate`, { text: texts.join("\n") });
            const translatedTexts = (tRes.data.text || "").split("\n");
            let j = 0;
            const updatedWords = data.words.map((w: any) => {
              if (!w.translation && untranslated.some((u: any) => u.id === w.id)) {
                w.translation = translatedTexts[j] || "Từ vựng thông dụng";
                j++;
              }
              return w;
            });
            setSet({ ...data, words: updatedWords });
          } catch {}
        }
      })
      .catch(() => {
        if (!builtIn) router.push("/vocabulary");
      });
  }, [setId, router]);

  const toggleSaveWord = (e: React.MouseEvent, word: any) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    const isSaved = savedWordIds.includes(word.id);

    if (isSaved) {
      const updated = saved.filter((w: any) => w.id !== word.id);
      localStorage.setItem(getUserKey("savedWords"), JSON.stringify(updated));
      setSavedWordIds(updated.map((w: any) => w.id));
    } else {
      saved.unshift(word);
      localStorage.setItem(getUserKey("savedWords"), JSON.stringify(saved));
      setSavedWordIds(saved.map((w: any) => w.id));
      saveSrsWord(word, "good");
      setSrsMap(getSrsMap());
    }
  };

  const handleEnrichWord = async (wordObj: any) => {
    setEnrichingId(wordObj.id);
    try {
      const [dict, transRes] = await Promise.all([
        lookupWordDictionary(wordObj.word),
        !wordObj.translation
          ? axios.post(`${API_URL}/videos/translate`, { text: wordObj.word }).catch(() => ({ data: { text: "" } }))
          : Promise.resolve({ data: { text: wordObj.translation } }),
      ]);

      const updatedWords = set.words.map((w: any) => {
        if (w.id === wordObj.id) {
          return {
            ...w,
            phonetic: dict.phonetic || w.phonetic,
            translation: transRes.data?.text || w.translation || "Từ vựng thông dụng",
            definition: dict.example ? `${dict.definitionEn} — Ví dụ: "${dict.example}"` : dict.definitionEn || w.definition,
          };
        }
        return w;
      });
      setSet({ ...set, words: updatedWords });
    } finally {
      setEnrichingId(null);
    }
  };

  const filteredWords = useMemo(() => {
    if (!set?.words) return [];
    return set.words.filter((w: any) => {
      const q = search.trim().toLowerCase();
      if (
        q &&
        !w.word.toLowerCase().includes(q) &&
        !(w.translation && w.translation.toLowerCase().includes(q))
      ) {
        return false;
      }
      const srs = srsMap[w.word.toLowerCase()];
      if (filterStatus === "saved") return savedWordIds.includes(w.id);
      if (filterStatus === "new") return !srs;
      if (filterStatus === "learning") return srs && srs.level < 4;
      if (filterStatus === "mastered") return srs && srs.level >= 4;
      return true;
    });
  }, [set?.words, search, filterStatus, srsMap, savedWordIds]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const currentWords = filteredWords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!set) return <div className="p-8">Đang tải bộ từ vựng...</div>;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 h-full flex flex-col gap-5 overflow-y-auto">
      {/* HEADER CARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 md:p-6 rounded-3xl border border-border shadow-sm shrink-0">
        <div>
          <button
            onClick={() => router.push("/vocabulary")}
            className="text-muted-foreground hover:text-foreground mb-2 text-sm flex items-center gap-1 font-medium"
          >
            ← Quay lại danh sách bộ từ
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{set.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{set.description}</p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href={`/vocabulary/${set.id}/learn`}
            className="bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl font-bold text-sm md:text-base hover:opacity-90 shadow-md flex items-center gap-2 transition-transform hover:scale-105"
          >
            <span>🚀</span> Vào Phòng Luyện 4 Chế Độ ({set.words?.length || 0} từ)
          </Link>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3.5 rounded-2xl border border-border shrink-0">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: `Tất cả (${set.words?.length || 0})` },
            { id: "new", label: "Từ mới" },
            { id: "learning", label: "Đang học" },
            { id: "mastered", label: "Đã thuộc" },
            { id: "saved", label: "⭐ Đã lưu" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterStatus(tab.id as any);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* WORDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentWords.map((w: any) => {
          const isSaved = savedWordIds.includes(w.id);
          const srs = srsMap[w.word.toLowerCase()];
          const isPlaceholderDef = w.definition && w.definition.startsWith("Definition of ");

          return (
            <div
              key={w.id}
              onClick={() => speakEnglish(w.word)}
              className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col justify-between relative group hover:border-primary/50 transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                      {w.word}
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">🔊</span>
                    </h3>
                    {w.phonetic && <span className="text-xs text-muted-foreground font-mono">{w.phonetic}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {srs && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          srs.level >= 4
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-amber-500/15 text-amber-500"
                        }`}
                      >
                        Lv.{srs.level}
                      </span>
                    )}
                    <button
                      onClick={(e) => toggleSaveWord(e, w)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isSaved
                          ? "text-yellow-400 bg-yellow-400/10"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                      title={isSaved ? "Bỏ lưu" : "Lưu vào sổ tay & SRS"}
                    >
                      {isSaved ? "★" : "☆"}
                    </button>
                  </div>
                </div>

                <p className="font-bold text-foreground mt-2 text-base">
                  {w.translation || "Nhấn 🪄 bên dưới để tra nghĩa & ví dụ"}
                </p>

                <p className="text-muted-foreground text-xs mt-1.5 line-clamp-3 leading-relaxed">
                  {isPlaceholderDef ? `We often use "${w.word}" in daily English conversations.` : w.definition}
                </p>
              </div>

              {(isPlaceholderDef || !w.translation) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnrichWord(w);
                  }}
                  disabled={enrichingId === w.id}
                  className="mt-3 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 py-1.5 px-3 rounded-lg w-full transition-colors"
                >
                  {enrichingId === w.id ? "⏳ Đang tải từ điển..." : "🪄 Xem IPA chuẩn & Câu ví dụ thực tế"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4 shrink-0">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-bold disabled:opacity-40"
          >
            ← Trang trước
          </button>
          <span className="text-sm font-semibold">
            Trang {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-bold disabled:opacity-40"
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  );
}
