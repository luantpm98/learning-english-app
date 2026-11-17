"use client";
import { API_URL, speakEnglish } from "../../utils/storage";
import { ESSENTIAL_PHRASES, QA_REFLEX_ITEMS, GOLDEN_PATTERNS } from "../../utils/curatedData";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

type Phrase = {
  id: number;
  text: string;
  translation?: string;
  category?: string;
  startTime?: number;
  endTime?: number;
  videoId?: number;
  video?: {
    title: string;
    youtubeId: string;
  };
};

type ReflexMode = "speed" | "qa" | "patterns";

export default function ReflexTrainingPage() {
  const [mode, setMode] = useState<ReflexMode>("speed");

  // Speed Translation Pool
  const [phrases, setPhrases] = useState<Phrase[]>(
    ESSENTIAL_PHRASES.map((p) => ({
      id: p.id,
      text: p.text,
      translation: p.translation,
      category: p.category,
    }))
  );
  const [userPhrases, setUserPhrases] = useState<Phrase[]>([]);
  const [poolType, setPoolType] = useState<"all" | "essential" | "saved">("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [duration, setDuration] = useState(6);
  const [showEnglishFirst, setShowEnglishFirst] = useState(false);
  const [handsFree, setHandsFree] = useState(false);

  // Active Session State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);

  // Mic / Speech Recognition inside Reflex
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [spokenScore, setSpokenScore] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Q&A Reflex state
  const [qaIndex, setQaIndex] = useState(0);
  const [qaSpoken, setQaSpoken] = useState("");
  const [qaFeedback, setQaFeedback] = useState<{ score: number; matched: string[] } | null>(null);
  const [qaShowSample, setQaShowSample] = useState(false);

  // Manual Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [newTrans, setNewTrans] = useState("");

  useEffect(() => {
    fetchPhrases();
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
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
        ...ESSENTIAL_PHRASES.map((p) => ({
          id: p.id,
          text: p.text,
          translation: p.translation,
          category: p.category,
        })),
      ];
      setPhrases(combined);
      setQuestionCount(Math.min(10, combined.length));
    } catch {}
  };

  const filteredPhrases =
    poolType === "saved"
      ? userPhrases
      : poolType === "essential"
      ? ESSENTIAL_PHRASES.map((p) => ({
          id: p.id,
          text: p.text,
          translation: p.translation,
          category: p.category,
        }))
      : phrases;

  const activeTotal = Math.min(questionCount, Math.max(1, filteredPhrases.length));
  const currentPhrase = filteredPhrases[currentIndex];

  // Countdown loop for Speed Translation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isPaused && filteredPhrases.length > 0) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      } else {
        // Move to next phrase
        if (currentIndex < activeTotal - 1) {
          goToNextPhrase();
        } else {
          setIsPlaying(false);
          setIsPaused(false);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, isPaused, timeLeft, currentIndex, activeTotal, filteredPhrases.length]);

  // Halfway trigger: reveal answer & speak English model
  useEffect(() => {
    if (isPlaying && !isPaused && currentPhrase) {
      const halfway = Math.floor(duration / 2);
      if (timeLeft === halfway) {
        setRevealAnswer(true);
        if (!showEnglishFirst || handsFree) {
          speakEnglish(currentPhrase.text);
        }
      }
    }
  }, [isPlaying, isPaused, timeLeft, duration, showEnglishFirst, handsFree, currentPhrase]);

  const goToNextPhrase = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= activeTotal) {
      setIsPlaying(false);
      return;
    }
    setCurrentIndex(nextIdx);
    setTimeLeft(duration);
    setRevealAnswer(false);
    setSpokenText("");
    setSpokenScore(null);
    if (showEnglishFirst && filteredPhrases[nextIdx]) {
      speakEnglish(filteredPhrases[nextIdx].text);
    }
  };

  const startTraining = () => {
    if (filteredPhrases.length === 0) return alert("Chưa có mẫu câu nào trong nhóm này!");
    setCurrentIndex(0);
    setTimeLeft(duration);
    setRevealAnswer(false);
    setIsPaused(false);
    setSpokenText("");
    setSpokenScore(null);
    setIsPlaying(true);
    if (showEnglishFirst && filteredPhrases[0]) {
      speakEnglish(filteredPhrases[0].text);
    }
  };

  const evaluateSpeech = (targetText: string, spoken: string) => {
    const targetWords = targetText
      .toLowerCase()
      .replace(/[^a-z\s']/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const spokenWords = spoken
      .toLowerCase()
      .replace(/[^a-z\s']/g, "")
      .split(/\s+/)
      .filter(Boolean);
    let hits = 0;
    targetWords.forEach((w) => {
      if (spokenWords.includes(w)) hits++;
    });
    return Math.round((hits / Math.max(1, targetWords.length)) * 100);
  };

  const startMicForSpeed = () => {
    if (!currentPhrase) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome/Edge/Safari.");

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setIsPaused(true);
    setIsListening(true);
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript;
      setSpokenText(spoken);
      setSpokenScore(evaluateSpeech(currentPhrase.text, spoken));
      setRevealAnswer(true);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const startMicForQa = () => {
    const qa = QA_REFLEX_ITEMS[qaIndex];
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome/Edge/Safari.");

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setQaSpoken("");
    setQaFeedback(null);
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript;
      setQaSpoken(spoken);
      const lower = spoken.toLowerCase();
      const matched = qa.keywords.filter((k) => lower.includes(k));
      const wordCount = spoken.trim().split(/\s+/).length;
      // Score based on natural response length + relevant keywords
      const base = Math.min(60, wordCount * 10);
      const kwBonus = Math.min(40, matched.length * 15);
      setQaFeedback({ score: Math.min(100, base + kwBonus), matched });
      setQaShowSample(true);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
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
      alert("Không thể lưu mẫu câu lúc này, vui lòng thử lại!");
    }
  };

  const currentQa = QA_REFLEX_ITEMS[qaIndex];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto gap-5">
      {/* HEADER & MODE TABS */}
      {!isPlaying && (
        <div className="flex flex-col gap-4 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
              ⚡ Trung Tâm Phản Xạ Giao Tiếp Cấp Tốc
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rèn phản xạ bật câu tiếng Anh trong 3–5 giây mà không cần dịch thầm trong đầu.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-card p-1.5 rounded-2xl border border-border">
            <button
              onClick={() => setMode("speed")}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                mode === "speed" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ⚡ 1. Phản xạ 5 giây
            </button>
            <button
              onClick={() => {
                setMode("qa");
                speakEnglish(QA_REFLEX_ITEMS[qaIndex].questionEn);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                mode === "qa" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              💬 2. Hỏi - Đáp AI
            </button>
            <button
              onClick={() => setMode("patterns")}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                mode === "patterns" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🧩 3. Khung câu vàng
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODE 1: SPEED TRANSLATION REFLEX ==================== */}
      {mode === "speed" && (
        <>
          {!isPlaying ? (
            <div className="w-full flex flex-col items-center">
              {showAddForm ? (
                <div className="w-full max-w-xl">
                  <button onClick={() => setShowAddForm(false)} className="mb-4 text-muted-foreground hover:text-foreground font-semibold text-sm">
                    ← Quay lại
                  </button>
                  <form onSubmit={handleAddPhrase} className="w-full bg-card border border-border p-6 rounded-3xl shadow-xl space-y-4">
                    <h2 className="text-xl font-bold">Thêm mẫu câu phản xạ của riêng bạn</h2>
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Câu Tiếng Anh</label>
                      <input
                        required
                        value={newPhrase}
                        onChange={(e) => setNewPhrase(e.target.value)}
                        placeholder="VD: I'm looking forward to it."
                        className="w-full p-3.5 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Nghĩa Tiếng Việt</label>
                      <input
                        required
                        value={newTrans}
                        onChange={(e) => setNewTrans(e.target.value)}
                        placeholder="VD: Tôi rất mong đợi điều đó."
                        className="w-full p-3.5 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
                      />
                    </div>
                    <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90">
                      Lưu mẫu câu
                    </button>
                  </form>
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-5 md:p-7 shadow-xl flex flex-col gap-5">
                  {/* POOL */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-sm">Nguồn câu luyện tập</span>
                    <div className="flex gap-1.5 bg-background p-1 rounded-2xl border border-border overflow-x-auto">
                      <button
                        onClick={() => setPoolType("all")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                          poolType === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        Tất cả ({phrases.length})
                      </button>
                      <button
                        onClick={() => setPoolType("essential")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                          poolType === "essential" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        Cốt lõi ({ESSENTIAL_PHRASES.length})
                      </button>
                      <button
                        onClick={() => setPoolType("saved")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                          poolType === "saved" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        Đã lưu ({userPhrases.length})
                      </button>
                    </div>
                  </div>

                  {/* COUNT */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold">Số lượng câu mỗi hiệp</span>
                      <span className="text-primary font-extrabold">{activeTotal} câu</span>
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

                  {/* DIRECTION */}
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-sm">Chiều phản xạ</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowEnglishFirst(false)}
                        className={`py-3 px-3 rounded-2xl font-bold text-xs md:text-sm border transition-all ${
                          !showEnglishFirst ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-secondary/50 text-muted-foreground border-border"
                        }`}
                      >
                        🇻🇳 Việt → Anh
                        <span className="block text-[10px] font-normal opacity-80">Nhìn ý Việt, bật ra câu Anh</span>
                      </button>
                      <button
                        onClick={() => setShowEnglishFirst(true)}
                        className={`py-3 px-3 rounded-2xl font-bold text-xs md:text-sm border transition-all ${
                          showEnglishFirst ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-secondary/50 text-muted-foreground border-border"
                        }`}
                      >
                        🇬🇧 Anh → Việt
                        <span className="block text-[10px] font-normal opacity-80">Nghe & hiểu nghĩa tức thì</span>
                      </button>
                    </div>
                  </div>

                  {/* DURATION & HANDS-FREE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold">Thời gian phản xạ</span>
                        <span className="text-primary font-extrabold">{duration} giây/câu</span>
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
                      onClick={() => setHandsFree(!handsFree)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        handsFree ? "bg-emerald-500/15 border-emerald-500 text-emerald-500" : "bg-secondary/40 border-border text-muted-foreground"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">🎧 Chế độ Rảnh Tay</div>
                        <div className="text-[10px] opacity-80">Tự động đọc đáp án chuẩn</div>
                      </div>
                      <span className="font-extrabold text-xs">{handsFree ? "BẬT" : "TẮT"}</span>
                    </button>
                  </div>

                  <button
                    onClick={startTraining}
                    disabled={filteredPhrases.length === 0}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-extrabold text-base md:text-lg hover:opacity-90 shadow-lg disabled:opacity-50"
                  >
                    ⚡ Bắt đầu phản xạ ({activeTotal} câu)
                  </button>

                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-sm font-bold text-primary hover:underline text-center"
                  >
                    + Tự thêm mẫu câu giao tiếp của riêng bạn
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ACTIVE SPEED REFLEX SESSION */
            <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center items-center relative bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl min-h-[420px]">
              <div className="w-full flex items-center justify-between mb-6">
                <span className="font-mono text-xs md:text-sm font-bold text-muted-foreground">
                  Câu {currentIndex + 1} / {activeTotal}
                </span>
                <span className="font-mono text-lg font-extrabold text-primary bg-primary/15 px-4 py-1.5 rounded-xl">
                  ⏱ {timeLeft}s
                </span>
              </div>

              <div className="text-center w-full my-auto space-y-5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {showEnglishFirst ? "Hãy dịch nhanh câu này sang Tiếng Việt:" : "Nói to câu Tiếng Anh tương ứng:"}
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold leading-snug text-foreground">
                  {showEnglishFirst ? currentPhrase?.text : currentPhrase?.translation || "Chưa có bản dịch"}
                </h2>

                {/* Answer reveal box */}
                <div
                  className={`transition-all duration-300 p-4 rounded-2xl bg-primary/10 border border-primary/30 ${
                    revealAnswer ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="text-xs font-bold text-primary uppercase mb-1">Đáp án chuẩn:</div>
                  <h3 className="text-lg md:text-2xl text-primary font-extrabold">
                    {showEnglishFirst ? currentPhrase?.translation : currentPhrase?.text}
                  </h3>
                </div>

                {/* Spoken evaluation */}
                {spokenText && (
                  <div className="p-3 rounded-xl bg-secondary/60 border border-border text-sm">
                    <span className="text-muted-foreground">Bạn đã nói: </span>
                    <i className="font-semibold">"{spokenText}"</i>
                    {spokenScore !== null && (
                      <span
                        className={`ml-2 font-extrabold px-2 py-0.5 rounded-full text-xs ${
                          spokenScore >= 75 ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
                        }`}
                      >
                        Chuẩn {spokenScore}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="w-full flex flex-wrap items-center justify-center gap-2.5 mt-6 pt-4 border-t border-border">
                <button
                  onClick={startMicForSpeed}
                  className={`px-4 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500 text-black hover:opacity-90"
                  }`}
                >
                  {isListening ? "⏹ Đang nghe..." : "🎤 Nói kiểm tra"}
                </button>
                <button
                  onClick={() => {
                    setRevealAnswer(true);
                    if (currentPhrase) speakEnglish(currentPhrase.text);
                  }}
                  className="bg-secondary px-4 py-2.5 rounded-full font-bold text-xs md:text-sm"
                >
                  🔊 Xem & Nghe đáp án
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="bg-secondary px-4 py-2.5 rounded-full font-bold text-xs md:text-sm"
                >
                  {isPaused ? "▶ Tiếp tục" : "⏸ Tạm dừng"}
                </button>
                <button
                  onClick={goToNextPhrase}
                  className="bg-primary text-primary-foreground px-4 py-2.5 rounded-full font-bold text-xs md:text-sm"
                >
                  Câu tiếp →
                </button>
                <button
                  onClick={() => setIsPlaying(false)}
                  className="bg-red-500/15 text-red-500 px-4 py-2.5 rounded-full font-bold text-xs md:text-sm"
                >
                  Thoát
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================== MODE 2: REAL-TIME Q&A SPEAKING REFLEX ==================== */}
      {mode === "qa" && currentQa && (
        <div className="w-full max-w-2xl mx-auto bg-card border border-border rounded-3xl p-5 md:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary px-3 py-1 rounded-full">
              {currentQa.topic}
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              Tình huống {qaIndex + 1} / {QA_REFLEX_ITEMS.length}
            </span>
          </div>

          <div className="bg-secondary/50 border border-border rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">👤 Người bản xứ hỏi bạn:</span>
              <button
                onClick={() => speakEnglish(currentQa.questionEn)}
                className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold"
              >
                🔊 Nghe câu hỏi
              </button>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground leading-snug">
              "{currentQa.questionEn}"
            </h2>
            <p className="text-sm text-muted-foreground">{currentQa.questionVi}</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs md:text-sm text-amber-500">
            💡 <b>Gợi ý phản xạ nhanh:</b> {currentQa.hintVi}
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <button
              onClick={startMicForQa}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500 text-black hover:opacity-90"
              }`}
            >
              {isListening ? "⏹ Đang lắng nghe câu trả lời của bạn..." : "🎤 Bấm để trả lời bằng Tiếng Anh"}
            </button>
          </div>

          {qaSpoken && qaFeedback && (
            <div className="bg-background border border-border rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Câu trả lời của bạn:</span>
                <span className="text-sm font-extrabold text-emerald-500">Điểm phản xạ: {qaFeedback.score}%</span>
              </div>
              <p className="font-semibold text-base italic">"{qaSpoken}"</p>
              {qaFeedback.matched.length > 0 && (
                <p className="text-xs text-emerald-500">
                  ✓ Đã dùng đúng từ khóa tự nhiên: <b>{qaFeedback.matched.join(", ")}</b>
                </p>
              )}
            </div>
          )}

          <div>
            <button
              onClick={() => setQaShowSample(!qaShowSample)}
              className="text-xs font-bold text-primary hover:underline"
            >
              {qaShowSample ? "Ẩn câu trả lời mẫu" : "👀 Xem & nghe câu trả lời mẫu tự nhiên nhất"}
            </button>
            {qaShowSample && (
              <div className="mt-2 p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase">Câu trả lời gợi ý:</span>
                  <button
                    onClick={() => speakEnglish(currentQa.sampleAnswerEn)}
                    className="text-xs font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-lg"
                  >
                    🔊 Nghe mẫu
                  </button>
                </div>
                <p className="font-bold text-base text-foreground">{currentQa.sampleAnswerEn}</p>
                <p className="text-xs text-muted-foreground">{currentQa.sampleAnswerVi}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-3 border-t border-border">
            <button
              disabled={qaIndex === 0}
              onClick={() => {
                const prev = qaIndex - 1;
                setQaIndex(prev);
                setQaSpoken("");
                setQaFeedback(null);
                setQaShowSample(false);
                speakEnglish(QA_REFLEX_ITEMS[prev].questionEn);
              }}
              className="px-4 py-2 rounded-xl bg-secondary font-bold text-xs md:text-sm disabled:opacity-40"
            >
              ← Câu trước
            </button>
            <button
              onClick={() => {
                const next = (qaIndex + 1) % QA_REFLEX_ITEMS.length;
                setQaIndex(next);
                setQaSpoken("");
                setQaFeedback(null);
                setQaShowSample(false);
                speakEnglish(QA_REFLEX_ITEMS[next].questionEn);
              }}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs md:text-sm"
            >
              Câu hỏi tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODE 3: GOLDEN SENTENCE PATTERNS ==================== */}
      {mode === "patterns" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GOLDEN_PATTERNS.map((item) => (
            <div
              key={item.id}
              onClick={() => speakEnglish(item.exampleEn)}
              className="bg-card border border-border p-5 rounded-3xl shadow-sm hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary px-3 py-1 rounded-full">
                    Khung câu #{item.id}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">🔊</span>
                </div>
                <h3 className="text-lg font-extrabold text-primary mt-3">{item.pattern}</h3>
                <p className="text-sm font-semibold text-foreground mt-1">{item.meaningVi}</p>
                <div className="mt-3 p-3 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-sm font-bold text-foreground">"{item.exampleEn}"</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.exampleVi}</p>
                </div>
              </div>
              <p className="text-xs text-amber-500">💡 {item.tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
