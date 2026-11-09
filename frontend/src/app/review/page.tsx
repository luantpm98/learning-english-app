"use client";
import { getSrsMap, saveSrsWord, speakEnglish, SrsItem } from "../../utils/storage";
import { BUILTIN_VOCAB_SETS } from "../../utils/curatedData";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DailyReviewPage() {
  const [allSrs, setAllSrs] = useState<SrsItem[]>([]);
  const [dueQueue, setDueQueue] = useState<SrsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadSrsData();
  }, []);

  const loadSrsData = () => {
    const map = getSrsMap();
    let list = Object.values(map);

    // If user hasn't added any words to SRS yet, seed 10 core conversational words so they can start immediately
    if (list.length === 0) {
      const starter = BUILTIN_VOCAB_SETS[0].words.slice(0, 10);
      starter.forEach((w) => saveSrsWord(w, "hard"));
      list = Object.values(getSrsMap());
    }

    setAllSrs(list);
    const now = Date.now();
    const due = list.filter((item) => item.nextReview <= now + 60 * 1000);
    setDueQueue(due.length > 0 ? due : list.slice(0, 10));
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
            Thuật toán 5 hộp Leitner giúp não bộ ghi nhớ từ vựng vĩnh viễn chỉ với 5 phút mỗi ngày.
          </p>
        </div>
        {!isReviewing && (
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setIsReviewing(true);
              if (dueQueue[0]) speakEnglish(dueQueue[0].word);
            }}
            className="bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl font-bold text-sm md:text-base shadow-lg hover:opacity-90 shrink-0"
          >
            🚀 Bắt đầu ôn tập ngay ({dueQueue.length} từ)
          </button>
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
              <span>🎉 Tuyệt vời! Bạn vừa ôn tập xong {completedCount} từ vựng trong phiên hôm nay.</span>
              <Link href="/vocabulary" className="underline">
                Học thêm từ mới →
              </Link>
            </div>
          )}

          {/* WORD LIST IN SRS */}
          <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base md:text-lg">Danh sách từ trong bộ nhớ SRS ({allSrs.length} từ)</h2>
              <Link href="/vocabulary" className="text-xs font-bold text-primary hover:underline">
                + Thêm từ bộ từ vựng
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
                      <span>{item.word}</span>
                      <span className="text-xs text-muted-foreground font-mono">{item.phonetic}</span>
                      <span className="text-xs">🔊</span>
                    </div>
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
              Tiến độ: {currentIndex + 1} / {dueQueue.length}
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
                <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{currentItem.word}</h2>
                <p className="text-sm font-mono text-muted-foreground">{currentItem.phonetic}</p>

                {isFlipped ? (
                  <div className="mt-6 pt-6 border-t border-border w-full space-y-2 animate-in fade-in">
                    <div className="text-2xl font-extrabold text-emerald-500">{currentItem.translation}</div>
                    <p className="text-sm text-muted-foreground">{currentItem.definition}</p>
                  </div>
                ) : (
                  <p className="mt-8 text-xs text-muted-foreground bg-secondary px-4 py-1.5 rounded-full">
                    👆 Chạm để xem đáp án
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
