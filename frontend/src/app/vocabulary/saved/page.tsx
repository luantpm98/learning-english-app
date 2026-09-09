"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SavedWordsPage() {
  const [savedWords, setSavedWords] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedWords") || "[]");
    setSavedWords(saved);
  }, []);

  return (
    <div className="p-4 md:p-8 h-full flex flex-col gap-6 bg-[#12121A] text-white overflow-y-auto">
      <div className="flex items-center gap-4">
        <Link href="/vocabulary" className="text-gray-400 hover:text-white">← Quay lại</Link>
        <h1 className="text-3xl font-bold">Từ vựng đã lưu</h1>
      </div>
      
      {savedWords.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="text-6xl mb-4">⭐</div>
          <p>Chưa có từ vựng nào được lưu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedWords.map((v: any, i: number) => (
            <div key={i} className="bg-[#1E1E24] p-5 rounded-xl border border-[#2A2A35] flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl text-[#4ade80] mb-1">{v.word}</h3>
                <p className="text-white mb-2">{v.translation}</p>
                <p className="text-gray-400 text-sm">🇬🇧 {v.definition}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
