import { useState, useEffect, useCallback } from "react";
import { vocabulary, collectionWords } from "../data";

type Stage = "idle" | "question" | "answer" | "done";
type ReviewMode = "new" | "old";

const NEW_WORDS_PER_DAY = 5;
const levelColors = ["", "text-red-400", "text-yellow-400", "text-blue-400", "text-green-400", "text-purple-400"];
const levelLabels = ["", "New", "Learning", "Familiar", "Known", "Mastered"];
const levelBg = ["", "bg-red-500/15", "bg-yellow-500/15", "bg-blue-500/15", "bg-green-500/15", "bg-purple-500/15"];

const dueOldWords = vocabulary.filter((w) => w.nextReview <= "2026-08-30" && w.level >= 1);
const newWordPool = collectionWords.filter((w) => w.level === 0).slice(0, NEW_WORDS_PER_DAY);
const oldWordPool = [...vocabulary, ...collectionWords.filter((w) => w.level > 0)];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

export default function ReviewPage() {
  const [mode, setMode] = useState<ReviewMode>("new");
  const [stage, setStage] = useState<Stage>("idle");
  const [queue, setQueue] = useState(newWordPool);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<{ word: string; remembered: boolean }[]>([]);

  const current = queue[idx];
  const isAnswer = stage === "answer";

  const showAnswer = useCallback(() => {
    if (stage === "question") setStage("answer");
  }, [stage]);

  const grade = useCallback((remembered: boolean) => {
    if (stage !== "answer") return;
    setResults((r) => [...r, { word: current.word, remembered }]);
    if (idx + 1 >= queue.length) {
      setStage("done");
    } else {
      setIdx((i) => i + 1);
      setStage("question");
    }
  }, [stage, current, idx, queue.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (stage === "idle" || stage === "done") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); showAnswer(); }
      if (isAnswer && (e.key === "1" || e.key === "ArrowLeft")) grade(false);
      if (isAnswer && (e.key === "2" || e.key === "ArrowRight")) grade(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stage, isAnswer, showAnswer, grade]);

  const startNew = () => { setQueue(newWordPool); setIdx(0); setResults([]); setMode("new"); setStage("question"); };
  const startOld = () => { setQueue(shuffle(dueOldWords.length > 0 ? dueOldWords : oldWordPool).slice(0, 20)); setIdx(0); setResults([]); setMode("old"); setStage("question"); };
  const reset = () => setStage("idle");
  const progress = queue.length > 0 ? (idx / queue.length) * 100 : 0;

  if (stage === "idle") {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Daily Review</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Học 5 từ mới mỗi ngày và ôn lại từ cũ theo phương pháp lặp lại có khoảng cách.</p>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-6">
            {/* New words */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/15 flex items-center justify-center text-lg">🌱</div>
                <span className="font-bold text-[var(--foreground)]">Từ mới hôm nay</span>
              </div>
              <div className="text-5xl font-black text-[var(--primary)] mb-1.5" style={{ fontFamily: "Outfit,sans-serif" }}>{newWordPool.length}</div>
              <div className="text-xs text-[var(--muted-foreground)] mb-5 flex-1">từ mới từ bộ sưu tập · {NEW_WORDS_PER_DAY} từ / ngày</div>
              <button onClick={startNew} disabled={newWordPool.length === 0} className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity">
                {newWordPool.length === 0 ? "✓ Xong hôm nay!" : "▶ Học từ mới"}
              </button>
            </div>

            {/* Old words */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-lg">🔄</div>
                <span className="font-bold text-[var(--foreground)]">Ôn tập từ cũ</span>
              </div>
              <div className="text-5xl font-black text-[var(--accent)] mb-1.5" style={{ fontFamily: "Outfit,sans-serif" }}>
                {dueOldWords.length > 0 ? dueOldWords.length : oldWordPool.length}
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mb-5 flex-1">
                {dueOldWords.length > 0 ? `${dueOldWords.length} từ đến hạn ôn` : "ôn lại tất cả từ đã học"}
              </div>
              <button onClick={startOld} className="w-full py-3 bg-[var(--accent)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                ▶ {dueOldWords.length > 0 ? `Ôn ${dueOldWords.length} từ` : "Ôn lại từ cũ"}
              </button>
            </div>
          </div>

          {/* Progress by level */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-4">Tiến độ học từ vựng</h3>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((l) => {
                const count = vocabulary.filter((w) => w.level === l).length;
                const total = Math.max(vocabulary.length, 1);
                const pct = (count / total) * 100;
                const barColors = ["", "#f87171", "#fbbf24", "#60a5fa", "#4ade80", "#c084fc"];
                return (
                  <div key={l} className="flex items-center gap-3">
                    <span className={`w-20 text-xs font-medium ${levelColors[l]}`}>{levelLabels[l]}</span>
                    <div className="flex-1 bg-[var(--secondary)] rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColors[l] }} />
                    </div>
                    <span className="w-8 text-xs text-[var(--muted-foreground)] text-right mono">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)] flex justify-between">
              <span>Tổng trong bộ sưu tập: <span className="text-[var(--foreground)] font-medium">{vocabulary.length}</span> từ</span>
              <span className="text-[var(--primary)]">⌨ Phím tắt: Space / ← →</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    const correct = results.filter((r) => r.remembered).length;
    const pct = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm w-full">
          <div className="text-6xl mb-4">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Hoàn thành!</h2>
          <p className="text-[var(--muted-foreground)] mb-5 text-sm">
            {mode === "new" ? "Bạn vừa học xong từ mới hôm nay." : "Phiên ôn tập hoàn tất."}
          </p>
          <div className={`rounded-2xl border p-5 mb-5 ${pct >= 80 ? "bg-green-500/10 border-green-500/20" : pct >= 50 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            <div className={`text-5xl font-black mb-1 ${pct >= 80 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400"}`} style={{ fontFamily: "Outfit,sans-serif" }}>{pct}%</div>
            <div className="text-sm text-[var(--muted-foreground)]">{correct} / {results.length} từ nhớ được</div>
          </div>
          <div className="flex flex-col gap-1.5 mb-5 text-left max-h-44 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${r.remembered ? "bg-green-500/8 text-green-400" : "bg-red-500/8 text-red-400"}`}>
                <span className="font-bold w-3">{r.remembered ? "✓" : "✗"}</span>
                <span className="font-medium">{r.word}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-2.5 bg-[var(--secondary)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)]">Quay lại</button>
            <button onClick={mode === "new" ? startNew : startOld} className="flex-1 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-bold hover:opacity-90">Học lại</button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      <div className="max-w-lg mx-auto w-full flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${mode === "new" ? "bg-[var(--primary)]/15 text-[var(--primary)]" : "bg-[var(--accent)]/15 text-[var(--accent)]"}`}>
            {mode === "new" ? "🌱 Từ mới" : "🔄 Ôn tập"}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--muted-foreground)]">{idx + 1} / {queue.length}</span>
              <button onClick={reset} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕ Thoát</button>
            </div>
            <div className="w-full bg-[var(--secondary)] rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: mode === "new" ? "var(--primary)" : "var(--accent)" }} />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
            {/* Image */}
            {current.image && (
              <div className="relative h-36 bg-[var(--muted)]">
                <img src={current.image} alt={current.word} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}
            <div className="p-6 text-center">
              {current.level > 0 && (
                <div className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${levelBg[current.level]} ${levelColors[current.level]}`}>
                  {levelLabels[current.level]}
                </div>
              )}
              <h2 className="text-4xl font-black text-[var(--foreground)] mb-2" style={{ fontFamily: "Outfit,sans-serif" }}>{current.word}</h2>
              <div className="mono text-sm text-[var(--accent)] mb-5">{current.phonetic}</div>

              {!isAnswer ? (
                <div className="flex flex-col items-center gap-3">
                  <button onClick={showAnswer} className="px-8 py-2.5 bg-[var(--secondary)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors border border-[var(--border)]">
                    Hiện nghĩa
                  </button>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Nhấn Space hoặc Enter để hiện nghĩa</p>
                </div>
              ) : (
                <div className="text-left">
                  <div className="bg-[var(--secondary)] rounded-xl p-3.5 mb-3 border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Nghĩa</div>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">{current.meaning}</p>
                  </div>
                  <div className="bg-[var(--secondary)] rounded-xl p-3.5 mb-5 border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Ví dụ</div>
                    <p className="text-sm text-[var(--foreground)] italic leading-relaxed">"{current.example}"</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => grade(false)} className="flex-1 py-3 rounded-xl bg-red-500/12 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors border border-red-500/20">
                      ✕ Chưa nhớ
                      <span className="block text-[10px] font-normal opacity-60 mt-0.5">← hoặc phím 1</span>
                    </button>
                    <button onClick={() => grade(true)} className="flex-1 py-3 rounded-xl bg-green-500/12 text-green-400 text-sm font-bold hover:bg-green-500/20 transition-colors border border-green-500/20">
                      ✓ Đã nhớ
                      <span className="block text-[10px] font-normal opacity-60 mt-0.5">→ hoặc phím 2</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
