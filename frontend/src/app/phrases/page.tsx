"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Phrase = {
  id: number;
  text: string;
  translation?: string;
  videoId?: number;
  video?: {
    title: string;
    youtubeId: string;
  };
};

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) {
        router.push("/auth");
        return;
      }
      const user = JSON.parse(stored);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/phrases?userId=${user.id}`);
      setPhrases(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const deletePhrase = async (id: number) => {
    if (!confirm("Remove this phrase?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/phrases/${id}`);
      fetchPhrases();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Phrases</h1>
        <Link 
          href="/reflex"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:opacity-90 shadow-md"
        >
          ▶ Start Reflex Training
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {phrases.length === 0 && <div className="text-muted-foreground">You haven't saved any phrases yet. Go to a video and click 💾 on a subtitle to save it!</div>}
        {phrases.map((phrase) => (
          <div key={phrase.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col shadow-sm relative group">
            <button 
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(phrase.text);
                utterance.lang = 'en-US';
                utterance.volume = 1; // Maximum volume
                utterance.rate = 0.9; // Slightly slower for better clarity
                window.speechSynthesis.speak(utterance);
              }}
              className="absolute top-4 right-4 bg-secondary text-foreground w-8 h-8 rounded-full flex items-center justify-center opacity-50 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all"
              title="Listen to pronunciation"
            >
              🔊
            </button>
            <h3 className="font-bold text-xl mb-2 text-primary pr-8">{phrase.text}</h3>
            {phrase.translation && <p className="text-muted-foreground mb-4">{phrase.translation}</p>}
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium bg-secondary px-2 py-1 rounded line-clamp-1 max-w-[70%]">
                {phrase.video ? phrase.video.title : "Custom Phrase"}
              </span>
              <button 
                onClick={() => deletePhrase(phrase.id)}
                className="text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
