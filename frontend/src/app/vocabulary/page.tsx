"use client";
import { getUserKey } from "../../utils/storage";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

type VocabularySet = {
  id: number | string;
  name: string;
  description: string;
  thumbnail: string;
  _count?: {
    words: number;
  };
};

export default function VocabularySetsPage() {
  const [sets, setSets] = useState<VocabularySet[]>([]);
  const [dailyWords, setDailyWords] = useState<any[]>([]);
  const [savedWordsCount, setSavedWordsCount] = useState(0);

  useEffect(() => {
    // Load sets
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}/vocabulary-sets`).then((res) => {
      setSets(res.data);
    }).catch(console.error);

    // Mock daily words (take 5 random words from a set, ideally done on backend)
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}/vocabulary-sets/1`).then(res => {
      if (res.data?.words) {
        const shuffled = [...res.data.words].sort(() => 0.5 - Math.random());
        setDailyWords(shuffled.slice(0, 5));
      }
    }).catch(() => {});

    // Load saved words count
    const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    setSavedWordsCount(saved.length);
  }, []);

  return (
    <div className="p-4 md:p-8 h-full flex flex-col gap-8 bg-[#12121A] text-white overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Vocabulary</h1>
        <p className="text-gray-400 text-lg">Khám phá và lưu trữ các từ vựng mới mỗi ngày.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DAILY 5 */}
        <div className="bg-gradient-to-br from-[#1E1E24] to-[#2A2A35] rounded-[24px] p-6 border border-[#3A3A4A] shadow-xl flex flex-col">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            🔥 Đề xuất hôm nay
          </h2>
          <p className="text-gray-400 mb-6">5 từ mới dành riêng cho bạn</p>
          
          <div className="flex-1 flex flex-col gap-3 mb-6">
            {dailyWords.length > 0 ? dailyWords.map(w => (
              <div key={w.id} className="flex justify-between items-center bg-[#12121A] p-3 rounded-xl">
                <span className="font-bold text-[#4ade80]">{w.word}</span>
                <span className="text-sm text-gray-400">{w.translation || w.definition}</span>
              </div>
            )) : <div className="text-gray-500 italic">Đang tải...</div>}
          </div>
          
          {dailyWords.length > 0 && (
             <Link href="/vocabulary/1/learn" className="w-full py-3 bg-[#4ade80] text-black font-bold rounded-xl text-center hover:bg-[#3bca6b]">
               Học ngay
             </Link>
          )}
        </div>

        {/* SAVED WORDS */}
        <div className="bg-[#1E1E24] rounded-[24px] p-6 border border-[#3A3A4A] shadow-xl flex flex-col">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            ⭐ Từ vựng đã lưu
          </h2>
          <p className="text-gray-400 mb-6">Ôn tập các từ vựng bạn đã đánh dấu</p>
          
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
             <div className="text-5xl font-bold text-[#4ade80]">{savedWordsCount}</div>
             <div className="text-gray-400">từ đang chờ ôn tập</div>
          </div>
          
          <Link href="/vocabulary/saved" className="w-full py-3 mt-6 bg-[#2A2A35] text-white font-bold rounded-xl text-center hover:bg-[#3A3A4A]">
             Xem danh sách
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 mt-4">Các bộ từ vựng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/vocabulary/${set.id}`}
              className="group block bg-[#1E1E24] rounded-2xl border border-[#2A2A35] overflow-hidden hover:border-[#4ade80] transition-colors flex flex-col h-full shadow-lg"
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  src={set.thumbnail}
                  alt={set.name}
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10">
                  {set._count?.words || 0} từ
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-white mb-2">
                  {set.name}
                </h3>
                <p className="text-gray-400 text-sm flex-1">
                  {set.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
