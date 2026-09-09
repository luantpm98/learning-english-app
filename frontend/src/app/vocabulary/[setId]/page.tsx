"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

type Vocabulary = {
  id: number;
  word: string;
  definition: string;
  translation?: string;
  audioUrl?: string;
  phonetic?: string;
  imageUrl?: string;
};

type VocabularySet = {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  words: Vocabulary[];
};

export default function VocabularySetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.setId as string;
  
  const [set, setSet] = useState<VocabularySet | null>(null);

  const [savedWords, setSavedWords] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/vocabulary-sets/${id}`).then((res) => {
        setSet(res.data);
      }).catch((e) => {
        console.error(e);
        router.push("/vocabulary");
      });
    }
    const saved = JSON.parse(localStorage.getItem("savedWords") || "[]");
    setSavedWords(saved);
  }, [id, router]);

  // Auto translate missing words
  useEffect(() => {
    if (set && set.words.length > 0) {
      const untranslated = set.words.filter(w => !w.translation);
      if (untranslated.length > 0) {
        const texts = untranslated.map(w => w.word + ": " + w.definition);
        axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/videos/translate`, { text: texts.join('\n') })
          .then(res => {
            const translatedTexts = (res.data.text || "").split('\n');
            const newSet = { ...set };
            let j = 0;
            newSet.words = newSet.words.map(w => {
              if (!w.translation) {
                 w.translation = translatedTexts[j] || "Lỗi dịch thuật";
                 j++;
                 // Save to DB
                 axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/vocabularies/${w.id}`, { translation: w.translation }).catch(()=>{});
              }
              return w;
            });
            setSet(newSet);
          }).catch(console.error);
      }
    }
  }, [set?.id]);

  const toggleSaveWord = (word: Vocabulary) => {
    let saved = [...savedWords];
    if (saved.find(w => w.id === word.id)) {
       saved = saved.filter(w => w.id !== word.id);
    } else {
       saved.push(word);
    }
    setSavedWords(saved);
    localStorage.setItem("savedWords", JSON.stringify(saved));
  };

  if (!set) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 h-full flex flex-col gap-6 bg-[#12121A] text-white overflow-y-auto">
      <div className="flex gap-4 items-center">
        <Link href="/vocabulary" className="text-gray-400 hover:text-white">
          ← Quay lại
        </Link>
        <h1 className="text-3xl font-bold">{set.name}</h1>
      </div>
      
      <div className="flex gap-4 bg-[#1E1E24] border border-[#2A2A35] p-6 rounded-2xl items-center shadow-lg">
        <div className="flex-1">
          <p className="text-gray-400 text-lg mb-4">{set.description}</p>
          <p className="font-bold mb-4">{set.words.length} từ trong bộ này.</p>
          
          <Link
            href={`/vocabulary/${id}/learn`}
            className="inline-block bg-[#4ade80] text-black px-8 py-3 rounded-xl font-bold text-lg hover:opacity-90 shadow-[0_0_15px_rgba(74,222,128,0.2)] transition-all"
          >
            Bắt đầu học
          </Link>
        </div>
        <img src={set.thumbnail} alt="thumbnail" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"; }} className="w-full h-full rounded-xl object-cover hidden md:block" />
      </div>

      <h2 className="text-xl font-bold mt-4">Danh sách từ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {set.words.map((v) => {
          const isSaved = savedWords.some(w => w.id === v.id);
          return (
          <div key={v.id} className="bg-[#1E1E24] p-5 rounded-xl border border-[#2A2A35] flex justify-between items-start group relative overflow-hidden shadow-sm hover:border-[#3A3A4A] transition-all">
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-[#4ade80] drop-shadow-md">{v.word}</h3>
                  {v.phonetic && <span className="text-gray-500 font-mono text-sm">/{v.phonetic}/</span>}
                </div>
                <button 
                  onClick={() => toggleSaveWord(v)}
                  className={`text-2xl hover:scale-110 transition-transform ${isSaved ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400/50'}`}
                >
                  {isSaved ? "★" : "☆"}
                </button>
              </div>
              <p className="text-white drop-shadow-sm mb-2 font-medium flex items-center gap-2">
                {v.translation || "Bản dịch..."}
                {!v.translation && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.innerText = "Dịch...";
                      axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/videos/translate`, { text: v.word + ": " + v.definition })
                        .then(res => {
                           v.translation = res.data.text;
                           if (set) {
                             setSet({...set});
                           }
                        }).catch(() => e.currentTarget.innerText = "Lỗi");
                    }} 
                    className="text-xs bg-[#2A2A35] px-2 py-1 rounded text-gray-300 hover:text-white"
                  >
                    Dịch
                  </button>
                )}
              </p>
              <p className="text-gray-400 text-sm drop-shadow-sm line-clamp-2">🇬🇧 {v.definition}</p>
            </div>
            
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-20 group-hover:opacity-40 transition-all duration-300 pointer-events-none">
              <img src={v.imageUrl || `https://picsum.photos/seed/${v.word}/400/300`} onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${v.word}2/400/300`; }} alt={v.word} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E1E24] to-transparent"></div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
