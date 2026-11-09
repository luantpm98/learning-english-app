"use client";
import { getUserKey, speakEnglish } from "../../../utils/storage";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SavedWordsPage() {
  const router = useRouter();
  const [words, setWords] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    setWords(saved);
  }, []);

  const unsaveWord = (id: number) => {
    const updated = words.filter((w) => w.id !== id);
    localStorage.setItem(getUserKey("savedWords"), JSON.stringify(updated));
    setWords(updated);
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 h-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm shrink-0">
        <div>
          <button
            onClick={() => router.push("/vocabulary")}
            className="text-muted-foreground hover:text-foreground mb-2 text-sm flex items-center gap-1"
          >
            ← Quay lại bộ từ vựng
          </button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">⭐ Sổ Tay Từ Vựng Của Tôi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách các từ vựng bạn đã lưu từ video hoặc tự thêm để ôn luyện.
          </p>
        </div>

        {words.length > 0 && (
          <Link
            href="/vocabulary/saved/learn"
            className="bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl font-bold text-sm md:text-base hover:opacity-90 shadow-md flex items-center gap-2 shrink-0"
          >
            <span>🚀</span> Luyện 4 Chế Độ ({words.length} từ)
          </Link>
        )}
      </div>

      {words.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Bạn chưa lưu từ vựng nào</h2>
          <p className="max-w-md mb-6">
            Hãy bấm vào bất kỳ từ nào khi đang xem phụ đề Video hoặc bấm ngôi sao ☆ trong các bộ từ vựng để lưu vào đây.
          </p>
          <Link href="/vocabulary" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">
            Khám phá các bộ từ vựng
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {words.map((w: any) => (
            <div
              key={w.id}
              onClick={() => speakEnglish(w.word)}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between relative group cursor-pointer hover:border-primary/50"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                      {w.word} <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">🔊</span>
                    </h3>
                    {w.phonetic && <span className="text-xs text-muted-foreground font-mono">{w.phonetic}</span>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      unsaveWord(w.id);
                    }}
                    className="text-yellow-400 hover:text-red-500 text-lg px-2"
                    title="Xóa khỏi sổ tay"
                  >
                    ✕
                  </button>
                </div>
                <p className="font-bold text-foreground mt-2">{w.translation}</p>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{w.definition}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
