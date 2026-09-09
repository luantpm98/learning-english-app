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
  phonetic?: string;
  imageUrl?: string;
  audioUrl?: string;
};

export default function FlashcardLearnPage() {
  const params = useParams();
  const id = params.setId as string;
  
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/vocabulary-sets/${id}`).then((res) => {
        const shuffled = [...res.data.words].sort(() => 0.5 - Math.random());
        setWords(shuffled);
      }).catch(console.error);
    }
  }, [id]);

  if (words.length === 0) return <div className="p-8">Loading flashcards...</div>;

  const currentWord = words[currentIndex];

  const handleNext = (remembered: boolean) => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(curr => curr + 1);
      } else {
        setIsFinished(true);
      }
    }, 150);
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentWord.audioUrl) {
      new Audio(currentWord.audioUrl).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isFinished) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-bold mb-4 text-primary">Set Completed!</h1>
        <p className="text-xl text-muted-foreground mb-8">You've reviewed all {words.length} words.</p>
        <div className="flex gap-4">
          <button onClick={() => { setIsFinished(false); setCurrentIndex(0); }} className="bg-secondary text-foreground px-6 py-3 rounded-xl font-bold hover:bg-secondary/80">
            Review Again
          </button>
          <Link href="/vocabulary" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90">
            Back to Sets
          </Link>
        </div>
      </div>
    );
  }

  // Use placehold.co or Unsplash as fallback
  const fallbackImage = `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80`; // generic book image or similar
  const image = currentWord.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentWord.word)}&size=512&background=random&font-size=0.3`;

  return (
    <div className="p-4 md:p-8 h-full flex flex-col relative max-w-3xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <Link href={`/vocabulary/${id}`} className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-2">
          ← Exit
        </Link>
        <div className="font-mono text-muted-foreground font-bold">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="w-full bg-secondary h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((currentIndex) / words.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative perspective-1000 w-full mb-12">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full aspect-[3/4] md:aspect-[4/3] relative preserve-3d transition-transform duration-500 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-card border-2 border-border rounded-3xl flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow p-8 text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-primary mb-6">{currentWord.word}</h2>
            <button 
              onClick={playAudio}
              className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mb-8 hover:bg-primary hover:text-white transition-colors"
              title="Nghe phát âm"
            >
              🔊
            </button>
            <p className="text-muted-foreground text-sm uppercase tracking-widest absolute bottom-8">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card border-2 border-primary rounded-3xl flex flex-col shadow-lg overflow-hidden">
                  <div className="flex-1 w-full relative rounded-2xl overflow-hidden bg-black mt-4">
                    <img
                      src={currentWord.imageUrl || `https://loremflickr.com/400/300/${encodeURIComponent(currentWord.word)}`}
                      onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentWord.word)}&size=512&background=random`; }}
                      alt={currentWord.word}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
            
            <div className="h-1/2 w-full flex flex-col items-center justify-start p-6 text-center relative z-10 -mt-10">
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2 drop-shadow-sm">{currentWord.word}</h2>
              {currentWord.phonetic && <div className="text-lg font-mono text-muted-foreground mb-4">{currentWord.phonetic}</div>}
              
              <div className="w-full space-y-4 px-4 overflow-y-auto">
                 <p className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                   🇻🇳 {currentWord.translation || "Bản dịch..."}
                   {!currentWord.translation && (
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         e.currentTarget.innerText = "Dịch...";
                         axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/videos/translate`, { text: currentWord.word + ": " + currentWord.definition })
                           .then(res => {
                              const newWords = [...words];
                              newWords[currentIndex].translation = res.data.text;
                              setWords(newWords);
                           }).catch(() => e.currentTarget.innerText = "Lỗi");
                       }} 
                       className="text-sm bg-secondary px-3 py-1 rounded text-muted-foreground hover:text-foreground"
                     >
                       Dịch
                     </button>
                   )}
                 </p>
                 <p className="text-lg text-muted-foreground italic">
                   🇬🇧 "{currentWord.definition}"
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-auto">
        <button 
          onClick={() => {
            // Save word logic
            const saved = JSON.parse(localStorage.getItem("savedWords") || "[]");
            if (!saved.find((w: any) => w.id === currentWord.id)) {
              saved.push(currentWord);
              localStorage.setItem("savedWords", JSON.stringify(saved));
            }
            handleNext(false);
          }}
          className={`flex-1 max-w-[200px] py-4 rounded-2xl font-bold text-lg transition-all opacity-100 translate-y-0 bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200`}
        >
          Lưu từ
        </button>
        <button 
          onClick={() => handleNext(true)}
          className={`flex-1 max-w-[200px] py-4 rounded-2xl font-bold text-lg transition-all opacity-100 translate-y-0 bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200`}
        >
          Bỏ qua (Got it)
        </button>
      </div>
    </div>
  );
}
