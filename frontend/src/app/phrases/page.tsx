"use client";
import { API_URL, speakEnglish } from "../../utils/storage";
import { ESSENTIAL_PHRASES, ROLEPLAY_SCENARIOS, RoleplayScenario } from "../../utils/curatedData";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";

type Phrase = {
  id: number;
  text: string;
  translation?: string;
  category?: string;
  usage?: string;
  videoId?: number;
  video?: {
    title: string;
    youtubeId: string;
  };
};

export default function PhrasesAndConversationPage() {
  const [activeTab, setActiveTab] = useState<"roleplay" | "essential" | "saved">("roleplay");
  const [phrases, setPhrases] = useState<Phrase[]>([]);

  // Roleplay state
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(ROLEPLAY_SCENARIOS[0]);
  const [recordingLineIdx, setRecordingLineIdx] = useState<number | null>(null);
  const [lineScores, setLineScores] = useState<Record<string, { score: number; spoken: string }>>({});
  const recognitionRef = useRef<any>(null);

  // Practice speaking on essential/saved phrases
  const [recordingPhraseId, setRecordingPhraseId] = useState<number | null>(null);
  const [phraseScores, setPhraseScores] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return;
      const user = JSON.parse(stored);
      const res = await axios.get(`${API_URL}/phrases?userId=${user.id}`);
      if (Array.isArray(res.data)) {
        setPhrases(res.data);
      }
    } catch {}
  };

  const deletePhrase = async (id: number) => {
    if (!confirm("Xóa mẫu câu này khỏi danh sách đã lưu?")) return;
    try {
      await axios.delete(`${API_URL}/phrases/${id}`);
      fetchPhrases();
    } catch {}
  };

  const saveToMyPhrases = async (text: string, translation: string) => {
    try {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : { id: 1 };
      await axios.post(`${API_URL}/phrases`, {
        userId: user.id,
        text,
        translation,
      });
      fetchPhrases();
      alert("Đã lưu vào Mẫu câu của tôi để luyện phản xạ!");
    } catch {}
  };

  const togglePracticeLine = (key: string, targetText: string, idx: number) => {
    if (recordingLineIdx === idx && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecordingLineIdx(null);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome, Edge hoặc Safari.");
      return;
    }

    setRecordingLineIdx(idx);
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript;
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
      const score = Math.round((hits / Math.max(1, targetWords.length)) * 100);
      setLineScores((prev) => ({ ...prev, [key]: { score, spoken } }));
      setRecordingLineIdx(null);
    };

    recognition.onerror = () => setRecordingLineIdx(null);
    recognition.onend = () => setRecordingLineIdx(null);
    recognition.start();
  };

  const togglePracticePhrase = (id: number, targetText: string) => {
    if (recordingPhraseId === id && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecordingPhraseId(null);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Vui lòng dùng Chrome/Edge/Safari để chấm điểm giọng nói.");

    setRecordingPhraseId(id);
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript;
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
      setPhraseScores((prev) => ({ ...prev, [id]: Math.round((hits / Math.max(1, targetWords.length)) * 100) }));
      setRecordingPhraseId(null);
    };
    recognition.onerror = () => setRecordingPhraseId(null);
    recognition.onend = () => setRecordingPhraseId(null);
    recognition.start();
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 h-full flex flex-col gap-6 overflow-y-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Luyện Giao Tiếp Thực Chiến & Mẫu Câu</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Đóng vai hội thoại tình huống thực tế (Roleplay), luyện nói chấm điểm AI và phản xạ câu giao tiếp.
          </p>
        </div>
        <Link
          href="/reflex"
          className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl font-bold text-sm hover:opacity-90 shadow-md flex items-center gap-2 shrink-0 w-fit"
        >
          ⚡ Luyện Phản Xạ Tốc Độ (Reflex)
        </Link>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-card p-1.5 rounded-2xl border border-border w-fit max-w-full overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab("roleplay")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all ${
            activeTab === "roleplay"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🎭 1. Hội Thoại Tình Huống (Roleplay)
        </button>
        <button
          onClick={() => setActiveTab("essential")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all ${
            activeTab === "essential"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          💬 2. Mẫu Câu Giao Tiếp Cốt Lõi ({ESSENTIAL_PHRASES.length})
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all ${
            activeTab === "saved"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          💾 3. Đã Lưu Từ Video ({phrases.length})
        </button>
      </div>

      {/* TAB 1: INTERACTIVE SITUATIONAL ROLEPLAY */}
      {activeTab === "roleplay" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scenario selector */}
          <div className="lg:col-span-4 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
            {ROLEPLAY_SCENARIOS.map((sc) => {
              const active = selectedScenario.id === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc)}
                  className={`min-w-[240px] lg:min-w-0 p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    active
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  <div className="text-3xl shrink-0">{sc.icon}</div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {sc.level}
                    </span>
                    <h3 className="font-bold text-sm md:text-base mt-1 line-clamp-1">{sc.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{sc.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dialogue practice panel */}
          <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
            <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedScenario.icon}</span>
                  <h2 className="text-xl font-bold">{selectedScenario.title}</h2>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{selectedScenario.situation}</p>
              </div>
              <button
                onClick={() => {
                  const fullText = selectedScenario.lines.map((l) => l.en).join(". ");
                  speakEnglish(fullText, 0.9);
                }}
                className="px-4 py-2 rounded-xl bg-primary/15 text-primary font-bold text-xs hover:bg-primary hover:text-primary-foreground transition-colors shrink-0 w-fit"
              >
                🔊 Nghe toàn bộ hội thoại
              </button>
            </div>

            <div className="space-y-4">
              {selectedScenario.lines.map((line, idx) => {
                const key = `${selectedScenario.id}-${idx}`;
                const result = lineScores[key];
                const isUserRole = line.speaker === "B";
                const isRec = recordingLineIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isUserRole
                        ? "bg-primary/5 border-primary/30 ml-0 md:ml-8"
                        : "bg-secondary/50 border-border mr-0 md:mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isUserRole ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isUserRole ? "🧑 Vai của bạn (Nói to câu này)" : `👤 ${line.roleName}`}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakEnglish(line.en)}
                          className="px-2.5 py-1 rounded-lg bg-card border border-border text-xs font-bold hover:border-primary"
                          title="Nghe phát âm mẫu"
                        >
                          🔊 Nghe mẫu
                        </button>
                        <button
                          onClick={() => togglePracticeLine(key, line.en, idx)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isRec
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-emerald-500 text-black hover:opacity-90"
                          }`}
                        >
                          {isRec ? "⏹ Đang nghe..." : "🎤 Tập nói"}
                        </button>
                        <button
                          onClick={() => saveToMyPhrases(line.en, line.vi)}
                          className="px-2 py-1 rounded-lg bg-card border border-border text-xs hover:border-primary"
                          title="Lưu câu này"
                        >
                          💾
                        </button>
                      </div>
                    </div>

                    <p className="text-base md:text-lg font-bold text-foreground leading-relaxed">{line.en}</p>
                    <p className="text-sm text-muted-foreground mt-1">{line.vi}</p>

                    {line.tip && (
                      <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                        💡 Mẹo giao tiếp: {line.tip}
                      </div>
                    )}

                    {result && (
                      <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">
                          Bạn đã nói: <i className="text-foreground">"{result.spoken}"</i>
                        </span>
                        <span
                          className={`font-extrabold px-2.5 py-1 rounded-full ${
                            result.score >= 80
                              ? "bg-emerald-500/20 text-emerald-500"
                              : "bg-amber-500/20 text-amber-500"
                          }`}
                        >
                          Độ chuẩn: {result.score}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ESSENTIAL CONVERSATIONAL PHRASES */}
      {activeTab === "essential" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ESSENTIAL_PHRASES.map((item) => {
            const score = phraseScores[item.id];
            const isRec = recordingPhraseId === item.id;
            return (
              <div
                key={item.id}
                className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => speakEnglish(item.text)}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm hover:bg-primary hover:text-primary-foreground"
                        title="Nghe câu"
                      >
                        🔊
                      </button>
                      <button
                        onClick={() => togglePracticePhrase(item.id, item.text)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          isRec ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500/15 text-emerald-500"
                        }`}
                        title="Thu âm luyện nói"
                      >
                        🎤
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-primary leading-snug mb-1.5">{item.text}</h3>
                  <p className="font-medium text-foreground text-sm mb-2">{item.translation}</p>
                  <p className="text-xs text-muted-foreground bg-secondary/50 p-2.5 rounded-xl">
                    💡 Ngữ cảnh: {item.usage}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  {score !== undefined ? (
                    <span className="text-xs font-bold text-emerald-500">Điểm phát âm: {score}%</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Nhấn 🎤 để thử nói</span>
                  )}
                  <button
                    onClick={() => saveToMyPhrases(item.text, item.translation)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Đưa vào Reflex
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: SAVED PHRASES FROM VIDEOS */}
      {activeTab === "saved" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phrases.length === 0 ? (
            <div className="col-span-full bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground">
              <div className="text-4xl mb-3">💾</div>
              <p className="mb-4">
                Bạn chưa lưu câu nào từ Video. Bạn có thể bấm nút 💾 trên từng dòng phụ đề khi xem Video hoặc lưu từ mục Mẫu Câu Giao Tiếp Cốt Lõi!
              </p>
              <button
                onClick={() => setActiveTab("essential")}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm"
              >
                Xem Mẫu Câu Cốt Lõi
              </button>
            </div>
          ) : (
            phrases.map((phrase) => (
              <div
                key={phrase.id}
                className="bg-card border border-border p-5 rounded-2xl flex flex-col shadow-sm relative group"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-lg text-primary pr-2">{phrase.text}</h3>
                  <button
                    onClick={() => speakEnglish(phrase.text)}
                    className="bg-secondary text-foreground w-9 h-9 rounded-full flex items-center justify-center shrink-0 hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    🔊
                  </button>
                </div>
                {phrase.translation && <p className="text-muted-foreground text-sm mb-4">{phrase.translation}</p>}
                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-medium bg-secondary px-2.5 py-1 rounded-lg line-clamp-1 max-w-[70%]">
                    {phrase.video ? phrase.video.title : "Mẫu câu tự lưu"}
                  </span>
                  <button
                    onClick={() => deletePhrase(phrase.id)}
                    className="text-red-500 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-colors text-xs font-bold"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
