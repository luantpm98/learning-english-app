"use client";
import { API_URL, speakEnglish } from "../../utils/storage";
import { ESSENTIAL_PHRASES } from "../../utils/curatedData";

import { useState, useEffect } from "react";
import axios from "axios";

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
  const [phrases, setPhrases] = useState<Phrase[]>(
    ESSENTIAL_PHRASES.map((p) => ({ id: p.id, text: p.text, translation: p.translation }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Settings
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(6);
  const [showEnglishFirst, setShowEnglishFirst] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [poolType, setPoolType] = useState<"all" | "essential" | "saved">("all");

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);

  // Manual Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [newTrans, setNewTrans] = useState("");
  const [userPhrases, setUserPhrases] = useState<Phrase[]>([]);

  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return;
      const user = JSON.parse(stored);
      const res = await axios.get(`${API_URL}/phrases?userId=${user.id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setUserPhrases(list);
      const combined = [
        ...list,
        ...ESSENTIAL_PHRASES.map((p) => ({ id: p.id, text: p.text, translation: p.translation })),
      ];
      setPhrases(combined);
      setQuestionCount(Math.min(10, combined.length));
    } catch {}
  };

  const filteredPhrases =
    poolType === "saved"
      ? userPhrases
      : poolType === "essential"
      ? ESSENTIAL_PHRASES.map((p) => ({ id: p.id, text: p.text, translation: p.translation }))
      : phrases;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && filteredPhrases.length > 0) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      } else {
        if (currentIndex < Math.min(questionCount, filteredPhrases.length) - 1) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          setTimeLeft(duration);
          if (showEnglishFirst && filteredPhrases[nextIdx]) {
            speakEnglish(filteredPhrases[nextIdx].text);
          }
        } else {
          setIsPlaying(false);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, currentIndex, filteredPhrases, duration, questionCount, showEnglishFirst]);

  // Speak answer when halfway through timer if Vietnamese was shown first
  useEffect(() => {
    if (isPlaying && !showEnglishFirst && timeLeft === Math.floor(duration / 2)) {
      const p = filteredPhrases[currentIndex];
      if (p) speakEnglish(p.text);
    }
  }, [isPlaying, timeLeft, duration, showEnglishFirst, currentIndex, filteredPhrases]);

  const startTraining = () => {
    if (filteredPhrases.length === 0) return alert("Chưa có mẫu câu nào trong nhóm này!");
    setCurrentIndex(0);
    setTimeLeft(duration);
    setIsPlaying(true);
    if (showEnglishFirst && filteredPhrases[0]) {
      speakEnglish(filteredPhrases[0].text);
    }
  };

  const handleAddPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : { id: 1 };
      await axios.post(`${API_URL}/phrases`, {
        userId: user.id,
        text: newPhrase,
        translation: newTrans,
      });
      setNewPhrase("");
      setNewTrans("");
      setShowAddForm(false);
      fetchPhrases();
    } catch {
      alert("Không thể lưu mẫu câu");
    }
  };

  const currentPhrase = filteredPhrases[currentIndex];

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full p-4 pb-24 md:pb-8 overflow-y-auto">
      {!isPlaying ? (
        <div className="w-full flex flex-col items-center">
          {showAddForm ? (
            <div className="w-full">
              <button onClick={() => setShowAddForm(false)} className="mb-4 text-muted-foreground hover:text-foreground">
                ← Quay lại
              </button>
              <form
                onSubmit={handleAddPhrase}
                className="w-full bg-card border border-border p-6 md:p-8 rounded-3xl shadow-xl"
              >
                <h2 className="text-2xl font-bold mb-2">Thêm mẫu câu phản xạ</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Mẫu câu này sẽ được lưu vào danh sách của bạn để luyện phản xạ nói nhanh.
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Câu Tiếng Anh
                    </label>
                    <input
                      required
                      value={newPhrase}
                      onChange={(e) => setNewPhrase(e.target.value)}
                      placeholder="VD: I'm looking forward to it."
                      className="w-full p-3.5 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Nghĩa Tiếng Việt
                    </label>
                    <input
                      required
                      value={newTrans}
                      onChange={(e) => setNewTrans(e.target.value)}
                      placeholder="VD: Tôi rất mong đợi điều đó."
                      className="w-full p-3.5 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 mt-2"
                  >
                    Lưu mẫu câu
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-4xl font-extrabold mb-2 text-center">⚡ Luyện Phản Xạ Nói Tức Thì</h1>
              <p className="text-muted-foreground text-center text-sm md:text-base mb-6 max-w-md">
                Nhìn Tiếng Việt → Bật ra câu Tiếng Anh trong vòng {Math.floor(duration / 2)} giây trước khi đáp án và giọng đọc mẫu xuất hiện!
              </p>

              <div className="w-full bg-card border border-border rounded-3xl p-5 md:p-8 shadow-xl flex flex-col gap-6">
                {/* POOL */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-sm">Nguồn câu luyện tập</span>
                  <div className="flex gap-1.5 bg-background p-1 rounded-2xl border border-border">
                    <button
                      onClick={() => setPoolType("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        poolType === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Tất cả ({phrases.length})
                    </button>
                    <button
                      onClick={() => setPoolType("essential")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        poolType === "essential" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Giao tiếp cốt lõi ({ESSENTIAL_PHRASES.length})
                    </button>
                    <button
                      onClick={() => setPoolType("saved")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        poolType === "saved" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Đã lưu ({userPhrases.length})
                    </button>
                  </div>
                </div>

                {/* COUNT SETTING */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">Số lượng câu mỗi hiệp</span>
                    <span className="text-primary font-extrabold">
                      {Math.min(questionCount, Math.max(1, filteredPhrases.length))} câu
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max={Math.max(3, filteredPhrases.length)}
                    step="1"
                    value={Math.min(questionCount, Math.max(3, filteredPhrases.length))}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* LANGUAGE DIRECTION */}
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-sm">Chiều phản xạ</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowEnglishFirst(false)}
                      className={`py-3 px-3 rounded-2xl font-bold text-xs md:text-sm border transition-all ${
                        !showEnglishFirst
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-secondary/50 text-muted-foreground border-border"
                      }`}
                    >
                      🇻🇳 Hiện Tiếng Việt trước
                      <span className="block text-[10px] font-normal opacity-80">Đọc to Tiếng Anh (Khuyên dùng)</span>
                    </button>
                    <button
                      onClick={() => setShowEnglishFirst(true)}
                      className={`py-3 px-3 rounded-2xl font-bold text-xs md:text-sm border transition-all ${
                        showEnglishFirst
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-secondary/50 text-muted-foreground border-border"
                      }`}
                    >
                      🇬🇧 Hiện Tiếng Anh trước
                      <span className="block text-[10px] font-normal opacity-80">Phản xạ dịch nghĩa nhanh</span>
                    </button>
                  </div>
                </div>

                {/* DURATION */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">Thời gian mỗi câu</span>
                    <span className="text-primary font-extrabold">{duration} giây</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="14"
                    step="2"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <button
                  onClick={startTraining}
                  disabled={filteredPhrases.length === 0}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-extrabold text-base md:text-lg hover:opacity-90 shadow-lg disabled:opacity-50"
                >
                  ⚡ Bắt đầu phản xạ ({Math.min(questionCount, filteredPhrases.length)} câu)
                </button>
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 text-sm font-bold text-primary hover:underline"
              >
                + Tự thêm mẫu câu giao tiếp của riêng bạn
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col justify-center items-center relative bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl min-h-[380px]">
          <div className="absolute top-4 right-4 font-mono text-lg font-extrabold text-primary bg-primary/15 px-4 py-1.5 rounded-xl">
            ⏱ {timeLeft}s
          </div>
          <div className="absolute top-4 left-4 font-mono text-xs md:text-sm font-bold text-muted-foreground">
            Câu {currentIndex + 1} / {Math.min(questionCount, filteredPhrases.length)}
          </div>

          <div className="text-center w-full my-8 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {showEnglishFirst ? "Nói nghĩa Tiếng Việt của câu này:" : "Hãy bật ra câu Tiếng Anh tương ứng:"}
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-snug px-2 text-foreground">
              {showEnglishFirst ? currentPhrase?.text : currentPhrase?.translation || "Chưa có bản dịch"}
            </h2>

            <div
              className={`transition-all duration-500 p-4 rounded-2xl bg-primary/10 border border-primary/30 ${
                timeLeft <= Math.floor(duration / 2) ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <div className="text-xs font-bold text-primary uppercase mb-1">Đáp án chuẩn:</div>
              <h3 className="text-xl md:text-3xl text-primary font-extrabold">
                {showEnglishFirst ? currentPhrase?.translation : currentPhrase?.text}
              </h3>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => currentPhrase && speakEnglish(currentPhrase.text)}
              className="bg-secondary px-5 py-2.5 rounded-full font-bold text-sm"
            >
              🔊 Nghe lại
            </button>
            <button
              onClick={() => setIsPlaying(false)}
              className="bg-red-500/15 text-red-500 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-red-500 hover:text-white transition-colors"
            >
              Kết thúc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
