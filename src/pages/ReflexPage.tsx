import { useState, useEffect, useRef } from "react";
import { phrases } from "../data";

type Mode = "idle" | "running" | "paused";
type DisplayLang = "en-first" | "vi-first";
type SideTab = "settings" | "custom";

interface CustomSentence { id: string; en: string; vi: string }

const builtinPool = phrases.concat([
  { id: "r1", en: "Time is money.", vi: "Thời gian là tiền bạc.", category: "Proverbs", saved: false },
  { id: "r2", en: "Actions speak louder than words.", vi: "Hành động có giá trị hơn lời nói.", category: "Proverbs", saved: false },
  { id: "r3", en: "Every cloud has a silver lining.", vi: "Trong cái khó ló cái khôn.", category: "Proverbs", saved: false },
  { id: "r4", en: "The early bird catches the worm.", vi: "Chim sâu nào dậy sớm sẽ bắt được con sâu.", category: "Proverbs", saved: false },
  { id: "r5", en: "Practice makes perfect.", vi: "Có công mài sắt, có ngày nên kim.", category: "Proverbs", saved: false },
  { id: "r6", en: "Don't judge a book by its cover.", vi: "Đừng đánh giá qua vẻ bề ngoài.", category: "Proverbs", saved: false },
  { id: "r7", en: "Better late than never.", vi: "Muộn còn hơn không.", category: "Proverbs", saved: false },
]);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReflexPage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [displayLang, setDisplayLang] = useState<DisplayLang>("en-first");
  const [duration, setDuration] = useState(5);
  const [sideTab, setSideTab] = useState<SideTab>("settings");
  const [useCustomOnly, setUseCustomOnly] = useState(false);

  // Custom sentences
  const [customSentences, setCustomSentences] = useState<CustomSentence[]>([
    { id: "cs1", en: "I need to practice my English every day.", vi: "Tôi cần luyện tiếng Anh mỗi ngày." },
    { id: "cs2", en: "Could you speak more slowly, please?", vi: "Bạn có thể nói chậm hơn một chút không?" },
  ]);
  const [newEn, setNewEn] = useState("");
  const [newVi, setNewVi] = useState("");
  const [addError, setAddError] = useState("");

  // Running state
  const [queue, setQueue] = useState<{ id: string; en: string; vi: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showTranslation, setShowTranslation] = useState(false);
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = queue[idx % Math.max(queue.length, 1)];

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const next = (q: typeof queue, dur: number) => {
    setIdx((i) => i + 1);
    setTimeLeft(dur);
    setShowTranslation(false);
    setCount((c) => c + 1);
  };

  useEffect(() => {
    if (mode !== "running") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          next(queue, duration);
          return duration;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [mode, idx, duration, queue]);

  const buildQueue = () => {
    const pool = useCustomOnly
      ? customSentences
      : [...builtinPool.map(p => ({ id: p.id, en: p.en, vi: p.vi })), ...customSentences];
    return shuffle(pool);
  };

  const start = () => {
    const q = buildQueue();
    if (q.length === 0) return;
    setQueue(q);
    setIdx(0);
    setCount(0);
    setTimeLeft(duration);
    setShowTranslation(false);
    setMode("running");
  };

  const stop = () => { clearTimer(); setMode("idle"); };
  const pause = () => { if (mode === "running") { clearTimer(); setMode("paused"); } else setMode("running"); };
  const skipNext = () => { clearTimer(); next(queue, duration); };

  const addCustom = () => {
    setAddError("");
    if (!newEn.trim()) { setAddError("Vui lòng nhập câu tiếng Anh."); return; }
    setCustomSentences(prev => [...prev, { id: `cs${Date.now()}`, en: newEn.trim(), vi: newVi.trim() }]);
    setNewEn("");
    setNewVi("");
  };

  const deleteCustom = (id: string) => setCustomSentences(prev => prev.filter(s => s.id !== id));

  const totalPool = useCustomOnly ? customSentences.length : builtinPool.length + customSentences.length;
  const progress = (duration - timeLeft) / duration;
  const circumference = 2 * Math.PI * 48;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Reflex Training</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Xây dựng phản xạ câu tức thì. Mỗi câu hiển thị {duration}s rồi tự động chuyển tiếp.</p>
          </div>

          {mode === "idle" ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[var(--foreground)]">Pool</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseCustomOnly(false)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${!useCustomOnly ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"}`}
                  >
                    All ({builtinPool.length + customSentences.length})
                  </button>
                  <button
                    onClick={() => setUseCustomOnly(true)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${useCustomOnly ? "bg-[var(--accent)] text-white" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"}`}
                  >
                    My sentences ({customSentences.length})
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs text-[var(--muted-foreground)] mb-3 block">Hiển thị ngôn ngữ</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["en-first", "vi-first"] as DisplayLang[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setDisplayLang(m)}
                      className={`py-2.5 rounded-lg text-xs font-medium transition-all ${displayLang === m ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                    >
                      {m === "en-first" ? "🇬🇧 English trước" : "🇻🇳 Tiếng Việt trước"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs text-[var(--muted-foreground)] mb-2 block">
                  Thời gian mỗi câu: <span className="text-[var(--foreground)] font-semibold mono">{duration}s</span>
                </label>
                <input type="range" min={3} max={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
                <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
                  <span>3s (nhanh)</span><span>15s (thư giãn)</span>
                </div>
              </div>

              <button
                onClick={start}
                disabled={totalPool === 0}
                className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                ⚡ Bắt đầu luyện phản xạ ({totalPool} câu)
              </button>
            </div>
          ) : (
            <div>
              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-3">
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-[var(--muted-foreground)]">Đã xem: </span>
                    <span className="font-semibold mono text-[var(--foreground)]">{count}</span>
                  </div>
                  <div className={`rounded-lg px-3 py-1.5 text-xs ${mode === "paused" ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"}`}>
                    {mode === "paused" ? "⏸ Tạm dừng" : "▶ Đang chạy"}
                  </div>
                </div>
                <button onClick={stop} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕ Dừng</button>
              </div>

              {/* Main card */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-center">
                {/* Timer ring */}
                <div className="flex items-center justify-center mb-5">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="var(--secondary)" strokeWidth="6" />
                      <circle
                        cx="56" cy="56" r="48" fill="none"
                        stroke="var(--primary)" strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold mono text-[var(--foreground)]">{timeLeft}</span>
                    </div>
                  </div>
                </div>

                {current && (
                  <>
                    <p className="text-xl font-semibold text-[var(--foreground)] leading-relaxed mb-3" style={{ fontFamily: "Outfit,sans-serif" }}>
                      {displayLang === "en-first" ? current.en : current.vi}
                    </p>
                    <div className="min-h-[24px] mb-4">
                      {showTranslation ? (
                        <p className="text-sm text-[var(--accent)]">
                          {displayLang === "en-first" ? current.vi : current.en}
                        </p>
                      ) : (
                        <button onClick={() => setShowTranslation(true)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
                          Hiện bản dịch
                        </button>
                      )}
                    </div>
                  </>
                )}

                <div className="flex gap-3 justify-center">
                  <button onClick={pause} className="px-5 py-2 rounded-lg bg-[var(--secondary)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--muted)] transition-colors">
                    {mode === "paused" ? "▶ Tiếp tục" : "⏸ Dừng"}
                  </button>
                  <button onClick={skipNext} className="px-5 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-semibold hover:opacity-90 transition-opacity">
                    Tiếp →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Custom sentences */}
      <div className="w-80 flex-shrink-0 border-l border-[var(--border)] flex flex-col bg-[var(--card)]">
        {/* Panel tabs */}
        <div className="flex border-b border-[var(--border)]">
          {(["custom", "settings"] as SideTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setSideTab(t)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${sideTab === t ? "border-b-2 border-[var(--primary)] text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              {t === "custom" ? `Câu của tôi (${customSentences.length})` : "Thông tin"}
            </button>
          ))}
        </div>

        {sideTab === "custom" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Add form */}
            <div className="p-4 border-b border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)] mb-3">Thêm câu luyện tập của riêng bạn</p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Câu tiếng Anh..."
                  value={newEn}
                  onChange={(e) => { setNewEn(e.target.value); setAddError(""); }}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="text"
                  placeholder="Nghĩa tiếng Việt (tuỳ chọn)..."
                  value={newVi}
                  onChange={(e) => setNewVi(e.target.value)}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
                />
                {addError && <p className="text-xs text-red-400">{addError}</p>}
                <button
                  onClick={addCustom}
                  className="w-full py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-xs font-semibold hover:opacity-90"
                >
                  + Thêm câu
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {customSentences.length === 0 ? (
                <div className="p-6 text-center text-[var(--muted-foreground)] text-xs">
                  <div className="text-2xl mb-2">✍️</div>
                  <p>Chưa có câu nào. Thêm câu bên trên.</p>
                </div>
              ) : (
                customSentences.map((s) => (
                  <div key={s.id} className="flex items-start gap-2 p-3 border-b border-[var(--border)] group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--foreground)] leading-relaxed">{s.en}</p>
                      {s.vi && <p className="text-[11px] text-[var(--accent)] mt-0.5">{s.vi}</p>}
                    </div>
                    <button
                      onClick={() => deleteCustom(s.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] hover:text-red-400 flex-shrink-0 text-xs mt-0.5 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {[
                { label: "Câu tích hợp", value: builtinPool.length, color: "var(--primary)" },
                { label: "Câu của tôi", value: customSentences.length, color: "var(--accent)" },
                { label: "Tổng pool", value: builtinPool.length + customSentences.length, color: "var(--foreground)" },
              ].map((s) => (
                <div key={s.label} className="bg-[var(--secondary)] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">{s.label}</span>
                  <span className="text-sm font-bold mono" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
              <div className="bg-[var(--secondary)] rounded-xl p-3">
                <div className="text-xs text-[var(--muted-foreground)] mb-1.5">Mẹo luyện tập</div>
                <ul className="text-xs text-[var(--foreground)] leading-relaxed space-y-1.5">
                  <li>• Đọc to câu tiếng Anh ngay khi thấy</li>
                  <li>• Bắt chước ngữ điệu và nhịp điệu</li>
                  <li>• Không dừng lại để dịch từng từ</li>
                  <li>• Thực hành 5-10 phút mỗi ngày</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
