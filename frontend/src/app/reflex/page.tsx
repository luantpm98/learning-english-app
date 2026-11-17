"use client";
import { API_URL, getUserKey, speakEnglish } from "../../utils/storage";
import { ESSENTIAL_PHRASES, QA_REFLEX_ITEMS, GOLDEN_PATTERNS, QaReflexItem, SentencePatternItem } from "../../utils/curatedData";

import { useState, useEffect, useRef, useMemo } from "react";
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
  const [selectedIds, setSelectedIds] = useState<number[]>(ESSENTIAL_PHRASES.map((p) => p.id));
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

  // Q&A Reflex state (extensible with AI)
  const [qaList, setQaList] = useState<QaReflexItem[]>(QA_REFLEX_ITEMS);
  const [qaIndex, setQaIndex] = useState(0);
  const [qaSpoken, setQaSpoken] = useState("");
  const [qaFeedback, setQaFeedback] = useState<{ score: number; matched: string[] } | null>(null);
  const [qaShowSample, setQaShowSample] = useState(false);
  const [qaTopic, setQaTopic] = useState("Giao tiếp hàng ngày & Công sở");
  const [generatingQa, setGeneratingQa] = useState(false);

  // Golden Patterns state (extensible with AI)
  const [patternList, setPatternList] = useState<SentencePatternItem[]>(GOLDEN_PATTERNS);
  const [patternTopic, setPatternTopic] = useState("Giao tiếp thực tế & Công việc");
  const [generatingPatterns, setGeneratingPatterns] = useState(false);
  const [genError, setGenError] = useState("");

  // Manual Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [newTrans, setNewTrans] = useState("");

  useEffect(() => {
    fetchPhrases();
    try {
      const savedQa = localStorage.getItem("custom_qa_reflex");
      if (savedQa) setQaList([...QA_REFLEX_ITEMS, ...JSON.parse(savedQa)]);
      const savedPatterns = localStorage.getItem("custom_golden_patterns");
      if (savedPatterns) setPatternList([...GOLDEN_PATTERNS, ...JSON.parse(savedPatterns)]);
    } catch {}
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const fetchPhrases = async () => {
    let localSaved: Phrase[] = [];
    try {
      localSaved = JSON.parse(localStorage.getItem(getUserKey("saved_reflex_phrases")) || "[]");
    } catch {}

    let backendList: Phrase[] = [];
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        const res = await axios.get(`${API_URL}/phrases?userId=${user.id}`);
        if (Array.isArray(res.data)) backendList = res.data;
      }
    } catch {}

    const seenTexts = new Set<string>();
    const mergedUser: Phrase[] = [];
    for (const p of [...localSaved, ...backendList]) {
      const k = String(p.text || "").toLowerCase().trim();
      if (k && !seenTexts.has(k)) {
        seenTexts.add(k);
        mergedUser.push(p);
      }
    }

    setUserPhrases(mergedUser);
    const combined = [
      ...mergedUser,
      ...ESSENTIAL_PHRASES.map((p) => ({
        id: p.id,
        text: p.text,
        translation: p.translation,
        category: p.category,
      })),
    ];
    setPhrases(combined);
    setSelectedIds(combined.map((p) => p.id));
  };

  const poolPhrases = useMemo(() => {
    if (poolType === "saved") return userPhrases;
    if (poolType === "essential") {
      return ESSENTIAL_PHRASES.map((p) => ({
        id: p.id,
        text: p.text,
        translation: p.translation,
        category: p.category,
      }));
    }
    return phrases;
  }, [poolType, phrases, userPhrases]);

  const activeSessionPhrases = useMemo(() => {
    const picked = poolPhrases.filter((p) => selectedIds.includes(p.id));
    return picked.length > 0 ? picked : poolPhrases;
  }, [poolPhrases, selectedIds]);

  const activeTotal = activeSessionPhrases.length;
  const currentPhrase = activeSessionPhrases[currentIndex];

  const toggleSelectPhrase = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Countdown loop for Speed Translation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isPaused && activeTotal > 0) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      } else {
        if (currentIndex < activeTotal - 1) {
          goToNextPhrase();
        } else {
          setIsPlaying(false);
          setIsPaused(false);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, isPaused, timeLeft, currentIndex, activeTotal]);

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
    if (showEnglishFirst && activeSessionPhrases[nextIdx]) {
      speakEnglish(activeSessionPhrases[nextIdx].text);
    }
  };

  const startTraining = () => {
    if (activeSessionPhrases.length === 0) return alert("Vui lòng chọn ít nhất 1 câu để luyện tập!");
    setCurrentIndex(0);
    setTimeLeft(duration);
    setRevealAnswer(false);
    setIsPaused(false);
    setSpokenText("");
    setSpokenScore(null);
    setIsPlaying(true);
    if (showEnglishFirst && activeSessionPhrases[0]) {
      speakEnglish(activeSessionPhrases[0].text);
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
    const qa = qaList[qaIndex];
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

  const handleGenerateMoreQa = async () => {
    setGenError("");
    const apiKey = localStorage.getItem("gemini_api_key") || "";
    if (!apiKey) {
      setGenError("Để AI tự động tạo câu mới theo chủ đề, vui lòng nhập Gemini API Key ở mục 🤖 Gia sư Gemini AI.");
      return;
    }
    setGeneratingQa(true);
    try {
      const res = await axios.post("/api/gemini-teacher", {
        action: "generate_qa",
        topic: qaTopic,
        apiKey,
        preferredModel: localStorage.getItem("gemini_preferred_model") || undefined,
      });
      if (Array.isArray(res.data?.items) && res.data.items.length > 0) {
        const newItems: QaReflexItem[] = res.data.items.map((it: any, idx: number) => ({
          id: Date.now() + idx,
          topic: it.topic || qaTopic,
          questionEn: it.questionEn,
          questionVi: it.questionVi,
          hintVi: it.hintVi || "",
          sampleAnswerEn: it.sampleAnswerEn,
          sampleAnswerVi: it.sampleAnswerVi,
          keywords: Array.isArray(it.keywords) ? it.keywords : [],
        }));
        const oldCustom = JSON.parse(localStorage.getItem("custom_qa_reflex") || "[]");
        const updatedCustom = [...oldCustom, ...newItems];
        localStorage.setItem("custom_qa_reflex", JSON.stringify(updatedCustom));
        const nextList = [...qaList, ...newItems];
        setQaList(nextList);
        const firstNewIdx = qaList.length;
        setQaIndex(firstNewIdx);
        setQaSpoken("");
        setQaFeedback(null);
        setQaShowSample(false);
        speakEnglish(newItems[0].questionEn);
      }
    } catch (err: any) {
      setGenError(err.response?.data?.error || "Không thể tạo thêm câu mới, vui lòng kiểm tra API Key.");
    } finally {
      setGeneratingQa(false);
    }
  };

  const handleGenerateMorePatterns = async () => {
    setGenError("");
    const apiKey = localStorage.getItem("gemini_api_key") || "";
    if (!apiKey) {
      setGenError("Để AI tự động tạo thêm khung câu mới, vui lòng nhập Gemini API Key ở mục 🤖 Gia sư Gemini AI.");
      return;
    }
    setGeneratingPatterns(true);
    try {
      const res = await axios.post("/api/gemini-teacher", {
        action: "generate_patterns",
        topic: patternTopic,
        apiKey,
        preferredModel: localStorage.getItem("gemini_preferred_model") || undefined,
      });
      if (Array.isArray(res.data?.items) && res.data.items.length > 0) {
        const newItems: SentencePatternItem[] = res.data.items.map((it: any, idx: number) => ({
          id: patternList.length + idx + 1,
          pattern: it.pattern,
          meaningVi: it.meaningVi,
          exampleEn: it.exampleEn,
          exampleVi: it.exampleVi,
          tip: it.tip || "",
        }));
        const oldCustom = JSON.parse(localStorage.getItem("custom_golden_patterns") || "[]");
        const updatedCustom = [...oldCustom, ...newItems];
        localStorage.setItem("custom_golden_patterns", JSON.stringify(updatedCustom));
        setPatternList((prev) => [...prev, ...newItems]);
      }
    } catch (err: any) {
      setGenError(err.response?.data?.error || "Không thể tạo thêm khung câu mới.");
    } finally {
      setGeneratingPatterns(false);
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
      alert("Không thể lưu mẫu câu lúc này, vui lòng thử lại!");
    }
  };

  const currentQa = qaList[qaIndex];

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto gap-5">
      {/* HEADER & MODE TABS */}
      {!isPlaying && (
        <div className="flex flex-col gap-4 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
              ⚡ Trung Tâm Phản Xạ Giao Tiếp Cấp Tốc
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Xem trước danh sách câu để học, sau đó luyện phản xạ bật câu tức thì trong 3–5 giây.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-card p-1.5 rounded-2xl border border-border">
            <button
              onClick={() => {
                setMode("speed");
                setGenError("");
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                mode === "speed" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ⚡ 1. Phản xạ 5 giây
            </button>
            <button
              onClick={() => {
                setMode("qa");
                setGenError("");
                if (qaList[qaIndex]) speakEnglish(qaList[qaIndex].questionEn);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                mode === "qa" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              💬 2. Hỏi - Đáp AI ({qaList.length})
            </button>
            <button
              onClick={() => {
                setMode("patterns");
                setGenError("");
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                mode === "patterns" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🧩 3. Khung câu vàng ({patternList.length})
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODE 1: SPEED TRANSLATION REFLEX ==================== */}
      {mode === "speed" && (
        <>
          {!isPlaying ? (
            <div className="w-full flex flex-col gap-6">
              {showAddForm ? (
                <div className="w-full max-w-xl mx-auto">
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
                <>
                  {/* SETTINGS PANEL */}
                  <div className="w-full bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-sm">Nguồn câu luyện tập</span>
                      <div className="flex gap-1.5 bg-background p-1 rounded-2xl border border-border overflow-x-auto">
                        <button
                          onClick={() => {
                            setPoolType("all");
                            setSelectedIds(phrases.map((p) => p.id));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                            poolType === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          Tất cả ({phrases.length})
                        </button>
                        <button
                          onClick={() => {
                            setPoolType("essential");
                            setSelectedIds(ESSENTIAL_PHRASES.map((p) => p.id));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                            poolType === "essential" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          Cốt lõi ({ESSENTIAL_PHRASES.length})
                        </button>
                        <button
                          onClick={() => {
                            setPoolType("saved");
                            setSelectedIds(userPhrases.map((p) => p.id));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                            poolType === "saved" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          Đã lưu ({userPhrases.length})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Direction */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowEnglishFirst(false)}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                            !showEnglishFirst ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 text-muted-foreground border-border"
                          }`}
                        >
                          🇻🇳 Việt → Anh
                        </button>
                        <button
                          onClick={() => setShowEnglishFirst(true)}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                            showEnglishFirst ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 text-muted-foreground border-border"
                          }`}
                        >
                          🇬🇧 Anh → Việt
                        </button>
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">Thời gian mỗi câu</span>
                          <span className="text-primary font-extrabold">{duration}s</span>
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

                      {/* Hands-free */}
                      <button
                        onClick={() => setHandsFree(!handsFree)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          handsFree ? "bg-emerald-500/15 border-emerald-500 text-emerald-500" : "bg-secondary/40 border-border text-muted-foreground"
                        }`}
                      >
                        <span className="font-bold text-xs">🎧 Chế độ Rảnh Tay</span>
                        <span className="font-extrabold text-xs">{handsFree ? "BẬT" : "TẮT"}</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={startTraining}
                        disabled={activeSessionPhrases.length === 0}
                        className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-2xl font-extrabold text-base hover:opacity-90 shadow-lg disabled:opacity-50"
                      >
                        ⚡ Bắt đầu phản xạ ({activeSessionPhrases.length} câu đã chọn)
                      </button>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="px-5 py-3.5 rounded-2xl bg-secondary font-bold text-sm hover:opacity-90 shrink-0"
                      >
                        + Thêm câu mới
                      </button>
                    </div>
                  </div>

                  {/* PREVIEW LIST OF SENTENCES TO LEARN BEFORE REFLEX */}
                  <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          📋 Danh Sách Câu Luyện Phản Xạ ({poolPhrases.length} câu)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Xem & nghe trước các câu bên dưới, hoặc tích chọn những câu bạn muốn luyện trong lượt này.
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedIds(poolPhrases.map((p) => p.id))}
                          className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-bold hover:opacity-90"
                        >
                          Chọn tất cả
                        </button>
                        <button
                          onClick={() => setSelectedIds([])}
                          className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-bold hover:opacity-90"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>

                    {poolPhrases.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Chưa có câu nào trong nhóm này. Hãy lưu câu từ Video hoặc bấm "+ Thêm câu mới".
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                        {poolPhrases.map((p) => {
                          const isChecked = selectedIds.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => toggleSelectPhrase(p.id)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                isChecked
                                  ? "bg-primary/5 border-primary/50"
                                  : "bg-background border-border opacity-70 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="mt-1 accent-primary w-4 h-4 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-foreground leading-snug">{p.text}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {p.translation || "Chưa có bản dịch"}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakEnglish(p.text);
                                }}
                                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs shrink-0 hover:bg-primary hover:text-primary-foreground"
                                title="Nghe trước"
                              >
                                🔊
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
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
        <div className="w-full max-w-3xl mx-auto space-y-4">
          {/* AI Generator Bar */}
          <div className="bg-card border border-border rounded-2xl p-3.5 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <input
              value={qaTopic}
              onChange={(e) => setQaTopic(e.target.value)}
              placeholder="Nhập chủ đề muốn AI tạo thêm câu (VD: Công nghệ, Y tế, Phỏng vấn)..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-border text-xs md:text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleGenerateMoreQa}
              disabled={generatingQa}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold text-xs md:text-sm hover:opacity-90 disabled:opacity-60 shrink-0"
            >
              {generatingQa ? "⏳ Đang tạo 5 câu mới..." : "✨ Tạo thêm 5 câu Hỏi-Đáp AI"}
            </button>
          </div>

          {genError && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-semibold">
              ⚠️ {genError}
            </div>
          )}

          <div className="bg-card border border-border rounded-3xl p-5 md:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary px-3 py-1 rounded-full">
                {currentQa.topic}
              </span>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                Câu {qaIndex + 1} / {qaList.length}
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
                  speakEnglish(qaList[prev].questionEn);
                }}
                className="px-4 py-2 rounded-xl bg-secondary font-bold text-xs md:text-sm disabled:opacity-40"
              >
                ← Câu trước
              </button>
              <button
                onClick={() => {
                  const next = (qaIndex + 1) % qaList.length;
                  setQaIndex(next);
                  setQaSpoken("");
                  setQaFeedback(null);
                  setQaShowSample(false);
                  speakEnglish(qaList[next].questionEn);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs md:text-sm"
              >
                Câu hỏi tiếp theo →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODE 3: GOLDEN SENTENCE PATTERNS ==================== */}
      {mode === "patterns" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-3.5 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <input
              value={patternTopic}
              onChange={(e) => setPatternTopic(e.target.value)}
              placeholder="Nhập chủ đề muốn AI tạo thêm khung câu (VD: Đàm phán, Du lịch, Thuyết trình)..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-border text-xs md:text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleGenerateMorePatterns}
              disabled={generatingPatterns}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold text-xs md:text-sm hover:opacity-90 disabled:opacity-60 shrink-0"
            >
              {generatingPatterns ? "⏳ Đang tạo 5 khung câu..." : "✨ Tạo thêm 5 Khung câu vàng AI"}
            </button>
          </div>

          {genError && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-semibold">
              ⚠️ {genError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patternList.map((item) => (
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
        </div>
      )}
    </div>
  );
}
