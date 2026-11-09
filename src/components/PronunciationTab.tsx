import { useState, useRef, useCallback } from "react";
import { type Subtitle } from "../data";

type RecordState = "idle" | "listening" | "processing" | "done" | "error";

interface WordResult { word: string; spoken: string; correct: boolean; similarity: number }

// Levenshtein similarity 0-1
function similarity(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a === b) return 1;
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0).map((_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return 1 - dp[m][n] / Math.max(m, n);
}

function scoreWords(target: string, spoken: string): WordResult[] {
  const targetWords = target.toLowerCase().replace(/[^a-z\s']/g, "").split(/\s+/).filter(Boolean);
  const spokenWords = spoken.toLowerCase().replace(/[^a-z\s']/g, "").split(/\s+/).filter(Boolean);
  return targetWords.map((word, i) => {
    const spokenWord = spokenWords[i] ?? "";
    const sim = similarity(word, spokenWord);
    return { word, spoken: spokenWord, correct: sim >= 0.85, similarity: sim };
  });
}

const hasSpeechRecognition = !!(typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));

type Props = { subtitles: Subtitle[]; onPlaySegment?: (sub: Subtitle) => void };

export default function PronunciationTab({ subtitles, onPlaySegment }: Props) {
  const [target, setTarget] = useState<Subtitle | null>(null);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [transcript, setTranscript] = useState("");
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [pulse, setPulse] = useState(false);
  const recognitionRef = useRef<any>(null);
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectSentence = (sub: Subtitle) => {
    setTarget(sub);
    resetResult();
    if (onPlaySegment) onPlaySegment(sub);
  };

  const resetResult = () => {
    setRecordState("idle");
    setTranscript("");
    setWordResults([]);
    setScore(null);
  };

  const startRecording = useCallback(() => {
    if (!hasSpeechRecognition) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setRecordState("listening");
    setTranscript("");
    setWordResults([]);
    setScore(null);
    setPulse(true);
    pulseRef.current = setInterval(() => setPulse((p) => !p), 600);

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setRecordState("processing");
      clearInterval(pulseRef.current!);
      setPulse(false);
      setTimeout(() => {
        if (target) {
          const results = scoreWords(target.en, result);
          const avg = results.reduce((s, r) => s + r.similarity, 0) / results.length;
          setWordResults(results);
          setScore(Math.round(avg * 100));
          setAttempts((a) => a + 1);
        }
        setRecordState("done");
      }, 300);
    };

    recognition.onerror = () => {
      clearInterval(pulseRef.current!);
      setPulse(false);
      setRecordState("error");
    };

    recognition.onend = () => {
      clearInterval(pulseRef.current!);
      setPulse(false);
      if (recordState === "listening") setRecordState("idle");
    };

    recognition.start();
  }, [target, recordState]);

  const stopRecording = () => {
    recognitionRef.current?.stop();
    clearInterval(pulseRef.current!);
    setPulse(false);
    setRecordState("idle");
  };

  const scoreColor = score === null ? "" : score >= 85 ? "text-green-400" : score >= 65 ? "text-yellow-400" : "text-red-400";
  const scoreBg = score === null ? "" : score >= 85 ? "bg-green-500/10 border-green-500/20" : score >= 65 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20";
  const scoreMsg = score === null ? "" : score >= 90 ? "Xuất sắc! Phát âm chuẩn rồi 🎉" : score >= 75 ? "Tốt lắm! Tiếp tục luyện tập 👍" : score >= 60 ? "Khá ổn, nhưng hãy thử lại 💪" : "Cần luyện thêm, đừng nản lòng! 🔥";

  return (
    <div className="flex flex-col md:flex-row gap-5 h-full">
      {/* Sentence picker - left column */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1.5 max-h-52 md:max-h-none overflow-y-auto">
        <p className="text-xs text-[var(--muted-foreground)] mb-1 font-medium">Chọn câu để video phát đúng câu đó & luyện nói:</p>
        {subtitles.length === 0 ? (
          <div className="text-xs text-[var(--muted-foreground)] bg-[var(--secondary)] rounded-lg p-3">Video này chưa có subtitle.</div>
        ) : (
          subtitles.map((sub) => (
            <button
              key={sub.id}
              onClick={() => selectSentence(sub)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all leading-relaxed ${
                target?.id === sub.id
                  ? "bg-[var(--primary)]/15 border border-[var(--primary)]/40 text-[var(--foreground)]"
                  : "bg-[var(--secondary)] border border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
              }`}
            >
              <span className="mono text-[9px] text-[var(--accent)] block mb-0.5">▶ {formatTime(sub.start)} — {formatTime(sub.end)}</span>
              {sub.en.length > 55 ? sub.en.slice(0, 55) + "…" : sub.en}
            </button>
          ))
        )}
      </div>

      {/* Main practice area */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-2">
        {!target ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center text-[var(--muted-foreground)]">
              <div className="text-4xl mb-3">🎤</div>
              <p className="text-sm font-medium mb-1">Chọn một câu để bắt đầu luyện Shadowing</p>
              <p className="text-xs opacity-70">Video sẽ chỉ phát đúng câu bạn chọn rồi tự dừng để bạn đọc theo</p>
            </div>
          </div>
        ) : (
          <>
            {/* Target sentence display */}
            <div className="bg-[var(--secondary)] rounded-xl p-4 border border-[var(--border)]">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed">{target.en}</p>
                  <p className="text-xs text-[var(--accent)] mt-1">{target.vi}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onPlaySegment && (
                    <button
                      onClick={() => onPlaySegment(target)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] font-semibold hover:bg-[var(--primary)]/25"
                    >
                      🔁 Nghe lại câu
                    </button>
                  )}
                  {attempts > 0 && (
                    <div className="flex-shrink-0 text-xs mono text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg px-2 py-1">
                      {attempts}× thử
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mic button area */}
            <div className="flex flex-col items-center gap-3 py-4">
              {!hasSpeechRecognition ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center max-w-sm">
                  <p className="text-red-400 text-sm font-medium mb-1">Trình duyệt không hỗ trợ</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Vui lòng dùng Chrome hoặc Edge để sử dụng tính năng nhận diện giọng nói.</p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    {recordState === "listening" && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-[var(--primary)] opacity-20 scale-150" />
                    )}
                    <button
                      onClick={recordState === "listening" ? stopRecording : startRecording}
                      disabled={recordState === "processing"}
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all shadow-lg ${
                        recordState === "listening"
                          ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 scale-105"
                          : recordState === "processing"
                          ? "bg-[var(--secondary)] cursor-wait"
                          : "bg-[var(--primary)] hover:opacity-90 hover:scale-105 shadow-green-500/20"
                      }`}
                    >
                      {recordState === "listening" ? "⏹" : recordState === "processing" ? "⏳" : "🎤"}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] text-center">
                    {recordState === "idle" && "Nhấn để bắt đầu ghi âm"}
                    {recordState === "listening" && (
                      <span className="text-red-400 font-medium animate-pulse">● Đang nghe... nhấn để dừng</span>
                    )}
                    {recordState === "processing" && "Đang phân tích..."}
                    {recordState === "done" && "Nhấn để thử lại"}
                    {recordState === "error" && <span className="text-red-400">Lỗi mic — kiểm tra quyền truy cập và thử lại</span>}
                  </p>
                </>
              )}
            </div>

            {/* Transcript shown */}
            {transcript && (
              <div className="bg-[var(--muted)] rounded-lg px-4 py-2.5 border border-[var(--border)]">
                <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Bạn đã nói:</span>
                <p className="text-sm text-[var(--foreground)] mt-0.5 italic">"{transcript}"</p>
              </div>
            )}

            {/* Word-by-word breakdown */}
            {wordResults.length > 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-xs text-[var(--muted-foreground)] mb-3 font-medium uppercase tracking-wider">Kết quả từng từ</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {wordResults.map((r, i) => (
                    <div
                      key={i}
                      className={`relative group flex flex-col items-center px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        r.correct
                          ? "bg-green-500/10 border-green-500/25 text-green-400"
                          : r.similarity >= 0.6
                          ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-400"
                          : "bg-red-500/10 border-red-500/25 text-red-400"
                      }`}
                    >
                      <span>{r.word}</span>
                      <span className="text-[9px] opacity-70 mono">{Math.round(r.similarity * 100)}%</span>
                    </div>
                  ))}
                </div>

                {score !== null && (
                  <div className={`rounded-xl border p-4 text-center ${scoreBg}`}>
                    <div className={`text-4xl font-bold mb-1 ${scoreColor}`} style={{ fontFamily: "Outfit,sans-serif" }}>
                      {score}%
                    </div>
                    <p className="text-sm text-[var(--foreground)]">{scoreMsg}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
