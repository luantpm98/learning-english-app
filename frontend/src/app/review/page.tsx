"use client";
import { getSrsMap, saveSrsWord, speakEnglish, SrsItem, getUserKey } from "../../utils/storage";
import { BUILTIN_VOCAB_SETS, ESSENTIAL_PHRASES } from "../../utils/curatedData";

import { useState, useEffect } from "react";
import Link from "next/link";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function DailyReviewPage() {
  const [allSrs, setAllSrs] = useState<SrsItem[]>([]);
  const [reviewPool, setReviewPool] = useState<SrsItem[]>([]);
  const [dueQueue, setDueQueue] = useState<SrsItem[]>([]);
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadSrsData();
  }, []);

  const buildMasterPool = (): SrsItem[] => {
    const map = getSrsMap();
    const srsList = Object.values(map);

    // Combine SRS words + saved words + curated vocab sets + essential phrases so pool is always rich & varied
    const extraPool: SrsItem[] = [];
    const seen = new Set(srsList.map((i) => i.word.toLowerCase()));

    try {
      const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
      for (const w of saved) {
        const key = String(w.word || "").toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          extraPool.push({
            id: w.id || Date.now(),
            word: w.word,
            phonetic: w.phonetic || `/${w.word}/`,
            translation: w.translation || "Từ vựng đã lưu",
            definition: w.definition || "",
            level: 1,
            nextReview: 0,
            lastReviewed: 0,
          });
        }
      }
    } catch {}

    for (const set of BUILTIN_VOCAB_SETS) {
      for (const w of set.words) {
        const key = w.word.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          extraPool.push({
            id: w.id,
            word: w.word,
            phonetic: w.phonetic,
            translation: w.translation,
            definition: w.definition,
            level: 1,
            nextReview: 0,
            lastReviewed: 0,
          });
        }
      }
    }

    for (const p of ESSENTIAL_PHRASES) {
      const key = p.text.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        extraPool.push({
          id: p.id,
          word: p.text,
          phonetic: p.category,
          translation: p.translation,
          definition: p.usage,
          level: 1,
          nextReview: 0,
          lastReviewed: 0,
        });
      }
    }

    return [...srsList, ...extraPool];
  };

  const loadSrsData = () => {
    const map = getSrsMap();
    let list = Object.values(map);

    if (list.length === 0) {
      const starter = BUILTIN_VOCAB_SETS[0].words.slice(0, 10);
      starter.forEach((w) => saveSrsWord(w, "hard"));
      list = Object.values(getSrsMap());
    }

    setAllSrs(list);
    setReviewPool(buildMasterPool());
  };

  const startRandomSession = () => {
    const fullPool = buildMasterPool();
    const now = Date.now();
    // Separate due SRS items and other varied items, shuffle both so every click yields a fresh set
    const dueSrs = shuffleArray(fullPool.filter((item) => item.nextReview > 0 && item.nextReview <= now + 60 * 1000));
    const freshOrOther = shuffleArray(fullPool.filter((item) => !dueSrs.some((d) => d.word === item.word)));

    // Mix due items with fresh items so even repeated clicks give different phrases!
    const combined = shuffleArray([...dueSrs.slice(0, Math.ceil(selectedCount / 2)), ...freshOrOther]).slice(
      0,
      selectedCount
    );

    setDueQueue(combined);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsReviewing(true);
    if (combined[0]) speakEnglish(combined[0].word);
  };

  const currentItem = dueQueue[currentIndex];

  const handleGrade = (quality: "again" | "hard" | "good" | "easy") => {
    if (!currentItem) return;
    saveSrsWord(currentItem, quality);
    setCompletedCount((c) => c + 1);
    setIsFlipped(false);

    if (currentIndex < dueQueue.length - 1) {
      const next = dueQueue[currentIndex + 1];
      setCurrentIndex((i) => i + 1);
      if (next) speakEnglish(next.word);
    } else {
      setIsReviewing(false);
      loadSrsData();
    }
  };

  const levelCounts = [1, 2, 3, 4, 5].map((lv) => allSrs.filter((i) => i.level === lv).length);

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 h-full flex flex-col gap-6 overflow-y-auto max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            🧠 Ôn Tập Ngắt Quãng (Spaced Repetition SRS)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mỗi lượt ôn tập hệ thống tự động trộn ngẫu nhiên từ vựng & cụm câu mới từ kho {reviewPool.length} mục.
          </p>
        </div>

        {!isReviewing && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-2 rounded-2xl">
              <span className="text-xs font-bold text-muted-foreground mr-1">Số câu:</span>
              {[5, 10, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedCount(num)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
                    selectedCount === num
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={startRandomSession}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm md:text-base shadow-lg hover:opacity-90"
            >
              🎲 Bắt đầu ôn ({selectedCount} câu ngẫu nhiên)
            </button>
          </div>
        )}
      </div>

      {!isReviewing ? (
        <>
          {/* 5 LEITNER BOXES VISUALIZATION */}
          <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm">
            <h2 className="font-bold text-base md:text-lg mb-4">Biểu đồ trí nhớ 5 cấp độ của bạn</h2>
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {[
                { lv: 1, name: "Hộp 1 · Mới học", interval: "4 giờ", color: "bg-rose-500/15 text-rose-500 border-rose-500/30" },
                { lv: 2, name: "Hộp 2 · Nhớ sơ", interval: "1 ngày", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
                { lv: 3, name: "Hộp 3 · Quen mặt", interval: "3 ngày", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
                { lv: 4, name: "Hộp 4 · Nhớ sâu", interval: "7 ngày", color: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30" },
                { lv: 5, name: "Hộp 5 · Thuộc lòng", interval: "30 ngày", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
              ].map((box, idx) => (
                <div key={box.lv} className={`rounded-2xl border p-3 md:p-4 text-center flex flex-col justify-between ${box.color}`}>
                  <span className="text-[11px] md:text-xs font-bold">{box.name}</span>
                  <span className="text-2xl md:text-4xl font-extrabold my-2">{levelCounts[idx]}</span>
                  <span className="text-[10px] opacity-80">Chu kỳ: {box.interval}</span>
                </div>
              ))}
            </div>
          </div>

          {completedCount > 0 && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 p-4 rounded-2xl font-bold text-sm flex items-center justify-between">
              <span>🎉 Tuyệt vời! Bạn vừa hoàn thành {completedCount} từ/cụm từ trong phiên ôn tập.</span>
              <button onClick={startRandomSession} className="underline font-extrabold">
                Ôn thêm lượt mới ({selectedCount} câu khác) →
              </button>
            </div>
          )}

          {/* WORD LIST IN SRS */}
          <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base md:text-lg">Từ & Cụm từ đã ghi nhớ trong SRS ({allSrs.length})</h2>
              <Link href="/vocabulary" className="text-xs font-bold text-primary hover:underline">
                + Học thêm bộ từ mới
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allSrs.map((item) => (
                <div
                  key={item.word}
                  onClick={() => speakEnglish(item.word)}
                  className="p-3.5 rounded-2xl bg-background border border-border flex items-center justify-between cursor-pointer hover:border-primary/50"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-primary flex items-center gap-1.5">
                      <span className="truncate">{item.word}</span>
                      <span className="text-xs shrink-0">🔊</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{item.phonetic}</div>
                    <div className="text-sm text-foreground truncate">{item.translation}</div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-secondary shrink-0">
                    Hộp {item.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ACTIVE SRS FLASHCARD SESSION */
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-5">
          <div className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground">
            <button onClick={() => setIsReviewing(false)} className="hover:text-foreground">
              ← Dừng phiên ôn
            </button>
            <span>
              Câu {currentIndex + 1} / {dueQueue.length}
            </span>
          </div>

          {currentItem && (
            <>
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[300px] bg-card border-2 border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl hover:border-primary/50 relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakEnglish(currentItem.word);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center"
                >
                  🔊
                </button>
                <span className="text-xs font-bold uppercase text-muted-foreground mb-2">
                  Hộp hiện tại: Cấp {currentItem.level}/5
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-2 leading-snug">
                  {currentItem.word}
                </h2>
                <p className="text-sm font-mono text-muted-foreground">{currentItem.phonetic}</p>

                {isFlipped ? (
                  <div className="mt-6 pt-6 border-t border-border w-full space-y-2">
                    <div className="text-2xl font-extrabold text-emerald-500">{currentItem.translation}</div>
                    <p className="text-sm text-muted-foreground">{currentItem.definition}</p>
                  </div>
                ) : (
                  <p className="mt-8 text-xs text-muted-foreground bg-secondary px-4 py-1.5 rounded-full">
                    👆 Chạm vào thẻ để xem đáp án
                  </p>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2.5 w-full">
                <button
                  onClick={() => handleGrade("again")}
                  className="py-3.5 rounded-2xl bg-red-500/15 text-red-500 font-bold text-xs md:text-sm hover:bg-red-500 hover:text-white transition-colors"
                >
                  😓 Quên
                  <span className="block text-[10px] opacity-75 font-normal">Về Hộp 1</span>
                </button>
                <button
                  onClick={() => handleGrade("hard")}
                  className="py-3.5 rounded-2xl bg-amber-500/15 text-amber-500 font-bold text-xs md:text-sm hover:bg-amber-500 hover:text-black transition-colors"
                >
                  🤔 Khó
                  <span className="block text-[10px] opacity-75 font-normal">Giữ hộp</span>
                </button>
                <button
                  onClick={() => handleGrade("good")}
                  className="py-3.5 rounded-2xl bg-blue-500/15 text-blue-500 font-bold text-xs md:text-sm hover:bg-blue-500 hover:text-white transition-colors"
                >
                  👍 Nhớ
                  <span className="block text-[10px] opacity-75 font-normal">+1 Hộp</span>
                </button>
                <button
                  onClick={() => handleGrade("easy")}
                  className="py-3.5 rounded-2xl bg-emerald-500/15 text-emerald-500 font-bold text-xs md:text-sm hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  ⚡ Rất dễ
                  <span className="block text-[10px] opacity-75 font-normal">+2 Hộp</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
