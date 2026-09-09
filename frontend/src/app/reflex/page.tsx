"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

type Phrase = {
  id: number;
  text: string;
  translation?: string;
  startTime?: number;
  endTime?: number;
  videoId?: number;
  video?: {
    title: string;
    youtubeId: string;
  };
};

export default function ReflexTrainingPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Settings
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(5); // 5 seconds
  const [showEnglishFirst, setShowEnglishFirst] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);
  const [poolType, setPoolType] = useState<"all" | "manual">("all");
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);

  // Manual Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [newTrans, setNewTrans] = useState("");

  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return;
      const user = JSON.parse(stored);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}/phrases`);
      const userPhrases = res.data.filter((p: any) => p.userId === user.id);
      setPhrases(userPhrases);
      setQuestionCount(Math.min(10, userPhrases.length)); // default to 10 or max
    } catch (e) {
      console.error(e);
    }
  };

  const manualPhrasesCount = phrases.filter(p => !p.videoId).length;
  const filteredPhrases = poolType === "all" ? phrases : phrases.filter(p => !p.videoId);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && filteredPhrases.length > 0) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      } else {
        // Next slide
        if (currentIndex < Math.min(questionCount, filteredPhrases.length) - 1) {
          setCurrentIndex(c => c + 1);
          setTimeLeft(duration);
        } else {
          setIsPlaying(false);
          alert("Completed all phrases!");
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, currentIndex, filteredPhrases, duration, questionCount]);

  const startTraining = () => {
    if (filteredPhrases.length === 0) return alert("No phrases to train in this pool!");
    // Shuffle here if needed, but for now we just use the filtered list
    const limit = Math.min(questionCount, filteredPhrases.length);
    if (limit <= 0) return;
    setCurrentIndex(0);
    setTimeLeft(duration);
    setIsPlaying(true);
  };

  const handleAddPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : null;
      if (!user) return alert("Please login");

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}/phrases`, {
        userId: user.id,
        text: newPhrase,
        translation: newTrans,
      });
      setNewPhrase("");
      setNewTrans("");
      setShowAddForm(false);
      fetchPhrases();
    } catch (err) {
      console.error(err);
      alert("Failed to add phrase");
    }
  };

  if (phrases.length === 0 && !showAddForm) return (
    <div className="p-8 text-center flex flex-col items-center justify-center h-full bg-[#12121A] text-white">
      <div className="text-6xl mb-4">📚</div>
      <h1 className="text-3xl font-bold mb-4">Chưa có mẫu câu nào!</h1>
      <p className="text-gray-400 mb-8 max-w-md">Bạn cần lưu mẫu câu từ video hoặc thêm thủ công để bắt đầu luyện phản xạ.</p>
      <div className="flex flex-col md:flex-row gap-4">
        <Link href="/videos" className="bg-[#4ade80] text-black px-8 py-3 rounded-xl font-bold hover:opacity-90">Tìm video</Link>
        <button onClick={() => setShowAddForm(true)} className="bg-[#2A2A35] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3A3A4A]">Thêm thủ công</button>
      </div>
    </div>
  );

  const currentPhrase = filteredPhrases[currentIndex];

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full p-4">
      
      {!isPlaying ? (
        <div className="w-full flex flex-col items-center">
          
          {showAddForm ? (
            <div className="w-full">
              <button onClick={() => setShowAddForm(false)} className="mb-6 text-gray-400 hover:text-white">← Quay lại</button>
              <form onSubmit={handleAddPhrase} className="w-full bg-[#1E1E24] border border-[#2A2A35] p-8 rounded-[24px] shadow-xl">
                <h2 className="text-2xl font-bold mb-2 text-white">Thêm mẫu câu thủ công</h2>
                <p className="text-gray-400 mb-6">Mẫu câu này sẽ được lưu vào danh sách của bạn để luyện phản xạ.</p>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Câu Tiếng Anh</label>
                    <input required value={newPhrase} onChange={e=>setNewPhrase(e.target.value)} placeholder="VD: I'm looking forward to it." className="w-full p-4 rounded-xl border border-[#3A3A4A] bg-[#12121A] text-white focus:outline-none focus:border-[#4ade80] text-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Nghĩa Tiếng Việt</label>
                    <input value={newTrans} onChange={e=>setNewTrans(e.target.value)} placeholder="VD: Tôi đang rất mong đợi điều đó." className="w-full p-4 rounded-xl border border-[#3A3A4A] bg-[#12121A] text-white focus:outline-none focus:border-[#4ade80] text-lg" />
                  </div>
                  <button type="submit" className="w-full bg-[#4ade80] text-black font-bold py-4 rounded-xl hover:opacity-90 mt-4 text-lg">Lưu mẫu câu</button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-3 text-white">Reflex Training</h1>
              <p className="text-gray-400 text-center mb-8 max-w-md leading-relaxed">
                Xây dựng phản xạ câu tức thì. Mỗi câu hiển thị {duration}s rồi tự động chuyển tiếp.
              </p>

              <div className="w-full bg-[#1E1E24] border border-[#2A2A35] rounded-[24px] p-6 md:p-8 shadow-xl flex flex-col gap-8 relative overflow-hidden">
                
                {/* POOL */}
                <div className="flex justify-between items-center relative z-10">
                  <span className="font-semibold text-gray-300">Pool</span>
                  <div className="flex gap-2 bg-[#12121A] p-1 rounded-full border border-[#2A2A35]">
                    <button 
                      onClick={() => setPoolType("all")}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${poolType === "all" ? "bg-[#4ade80] text-black" : "text-gray-400 hover:text-white"}`}
                    >
                      All ({phrases.length})
                    </button>
                    <button 
                      onClick={() => setPoolType("manual")}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${poolType === "manual" ? "bg-[#4ade80] text-black" : "text-gray-400 hover:text-white"}`}
                    >
                      My sentences ({manualPhrasesCount})
                    </button>
                  </div>
                </div>

                {/* COUNT SETTING */}
                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Số lượng câu luyện tập</span>
                    <span className="text-[#4ade80] font-bold">{questionCount} câu</span>
                  </div>
                  <input 
                    type="range" min="1" max={Math.max(1, filteredPhrases.length)} step="1" 
                    value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none bg-gradient-to-r from-[#4ade80] to-[#2A2A35] outline-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #4ade80 ${(questionCount / Math.max(1, filteredPhrases.length)) * 100}%, #2A2A35 ${(questionCount / Math.max(1, filteredPhrases.length)) * 100}%)`}}
                  />
                </div>

                {/* LANGUAGE */}
                <div className="flex flex-col gap-3 relative z-10">
                  <span className="font-semibold text-gray-300">Hiển thị ngôn ngữ</span>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowEnglishFirst(true)}
                      className={`flex-1 py-3 rounded-2xl font-bold transition-all ${showEnglishFirst ? 'bg-[#4ade80] text-black shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-[#252532] text-gray-400 border border-[#3A3A4A] hover:bg-[#2A2A3A]'}`}
                    >
                      🇬🇧 English trước
                    </button>
                    <button 
                      onClick={() => setShowEnglishFirst(false)}
                      className={`flex-1 py-3 rounded-2xl font-bold transition-all ${!showEnglishFirst ? 'bg-[#4ade80] text-black shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-[#252532] text-gray-400 border border-[#3A3A4A] hover:bg-[#2A2A3A]'}`}
                    >
                      🇻🇳 Tiếng Việt trước
                    </button>
                  </div>
                </div>

                {/* DURATION */}
                <div className="flex flex-col gap-3 relative z-10">
                  <span className="font-semibold text-gray-300 mb-1">Thời gian mỗi câu: <span className="text-white">{duration}s</span></span>
                  <input 
                    type="range" min="3" max="15" step="1" 
                    value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none bg-[#2A2A35] outline-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #4ade80 ${((duration - 3) / 12) * 100}%, #2A2A35 ${((duration - 3) / 12) * 100}%)`}}
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                    <span>3s (nhanh)</span>
                    <span>15s (thư giãn)</span>
                  </div>
                </div>

                {/* START BTN */}
                <button 
                  onClick={startTraining} 
                  disabled={filteredPhrases.length === 0}
                  className="relative z-10 w-full mt-2 bg-[#4ade80] text-black py-4 rounded-2xl font-bold text-lg hover:bg-[#3bca6b] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⚡️ Bắt đầu luyện ({Math.min(questionCount, filteredPhrases.length)} câu)
                </button>
                
                {/* DECORATION */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#4ade80] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
              </div>

              <button onClick={() => setShowAddForm(true)} className="mt-6 flex items-center gap-2 text-gray-400 hover:text-white font-medium bg-[#1A1A24] px-6 py-3 rounded-xl border border-[#2A2A35] hover:border-[#3A3A4A] transition-colors">
                <span className="text-xl leading-none">+</span> Thêm mẫu câu thủ công
              </button>
            </>
          )}

        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col justify-center items-center relative">
          <div className="absolute top-0 right-0 font-mono text-xl font-bold text-[#4ade80] bg-[#4ade80]/10 px-4 py-2 rounded-lg border border-[#4ade80]/20">
            {timeLeft}s
          </div>
          <div className="absolute top-0 left-0 font-mono text-sm font-bold text-gray-400 px-4 py-2">
            Câu {currentIndex + 1} / {Math.min(questionCount, filteredPhrases.length)}
          </div>
          
          <div className="text-center w-full">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight px-4 text-white drop-shadow-md">
              {showEnglishFirst ? currentPhrase?.text : (currentPhrase?.translation || "Chưa có bản dịch")}
            </h2>
            
            <div className={`transition-opacity duration-1000 ${timeLeft <= duration / 2 ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-2xl md:text-3xl text-gray-400 font-medium px-4">
                {showEnglishFirst ? (currentPhrase?.translation || "Chưa có bản dịch") : currentPhrase?.text}
              </h3>
            </div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <button onClick={() => setIsPlaying(false)} className="bg-[#2A2A35] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3A3A4A] transition-colors">
              Dừng luyện tập
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#12121A]">
            <div className="h-full bg-[#4ade80] transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(74,222,128,0.5)]" style={{ width: `${((duration - timeLeft) / duration) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
