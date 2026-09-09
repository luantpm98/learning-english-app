import { useState } from "react";
import { defaultVideos as videos, type Subtitle } from "../data";
import { type Page } from "../App";
import PronunciationTab from "../components/PronunciationTab";

type Props = { videoId: string; navigate: (p: Page, id?: string) => void };
type Tab = "subtitles" | "pronunciation" | "dictation" | "transcribe";

export default function VideoDetailPage({ videoId, navigate }: Props) {
  const video = videos.find((v: typeof videos[0]) => v.id === videoId);
  const [tab, setTab] = useState<Tab>("subtitles");
  const [showVi, setShowVi] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  // Dictation tab
  const [dictInput, setDictInput] = useState("");
  const [dictChecked, setDictChecked] = useState(false);
  const [dictSubIdx, setDictSubIdx] = useState(0);

  // Transcribe tab
  const [transInput, setTransInput] = useState("");
  const [transChecked, setTransChecked] = useState(false);
  const [transSubIdx, setTransSubIdx] = useState(0);

  if (!video) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)]">
        <div className="text-center">
          <div className="text-4xl mb-3">🎬</div>
          <p>Video not found.</p>
          <button onClick={() => navigate("videos")} className="mt-3 text-[var(--accent)] hover:underline text-sm">
            Back to library
          </button>
        </div>
      </div>
    );
  }

  const toggleSave = (sub: Subtitle) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(sub.id) ? next.delete(sub.id) : next.add(sub.id);
      return next;
    });
  };

  const dictSub = video.subtitles[dictSubIdx];
  const transSub = video.subtitles[transSubIdx];

  const getWordDiff = (target: string, input: string) => {
    const tw = target.split(/\s+/);
    const iw = input.split(/\s+/);
    return tw.map((w, i) => ({ word: w, correct: iw[i]?.toLowerCase() === w.toLowerCase() }));
  };

  const tabLabels: Record<Tab, string> = {
    subtitles: "📄 Subtitles",
    pronunciation: "🎤 Phát âm",
    dictation: "🎧 Chép chính tả",
    transcribe: "✍️ Ghi lại câu",
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--border)] bg-[var(--card)] flex-shrink-0">
        <button
          onClick={() => navigate("videos")}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm flex items-center gap-1.5 flex-shrink-0"
        >
          ← Thư viện
        </button>
        <span className="text-[var(--border)]">|</span>
        <h2 className="text-sm font-medium text-[var(--foreground)] truncate">{video.title}</h2>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Player + Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* YouTube embed */}
          <div className="bg-black flex-shrink-0 relative" style={{ paddingTop: "min(56.25%, 300px)" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border)] bg-[var(--card)] flex-shrink-0 overflow-x-auto">
            {(["subtitles", "pronunciation", "dictation", "transcribe"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
                  tab === t
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {tabLabels[t]}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">

            {/* SUBTITLES */}
            {tab === "subtitles" && (
              <div>
                {video.subtitles.length === 0 ? (
                  <div className="text-center py-10 text-[var(--muted-foreground)]">
                    <div className="text-3xl mb-2">📝</div>
                    <p className="text-sm">Video này chưa có subtitle.</p>
                    <p className="text-xs mt-1 opacity-60">Subtitle sẽ được tải tự động trong phiên bản đầy đủ.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[var(--muted-foreground)]">{video.subtitles.length} đoạn · nhấn để lưu câu hay</span>
                      <button
                        onClick={() => setShowVi(!showVi)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${showVi ? "bg-[var(--accent)] text-white" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"}`}
                      >
                        {showVi ? "🇻🇳 + 🇬🇧" : "🇬🇧 only"}
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {video.subtitles.map((sub) => (
                        <div
                          key={sub.id}
                          className={`group rounded-lg border p-3 cursor-pointer transition-all ${
                            activeSubId === sub.id
                              ? "border-[var(--primary)] bg-[var(--primary)]/8"
                              : "border-[var(--border)] bg-[var(--secondary)] hover:border-[var(--accent)]/50"
                          }`}
                          onClick={() => setActiveSubId(activeSubId === sub.id ? null : sub.id)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mono text-[10px] text-[var(--muted-foreground)] pt-0.5 w-10 flex-shrink-0">
                              {formatTime(sub.start)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--foreground)] leading-relaxed">{sub.en}</p>
                              {showVi && <p className="text-xs text-[var(--accent)] mt-1 leading-relaxed">{sub.vi}</p>}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSave(sub); }}
                              className={`opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-xs px-2 py-1 rounded ${
                                savedIds.has(sub.id)
                                  ? "opacity-100 bg-[var(--primary)] text-[var(--primary-foreground)]"
                                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                              }`}
                            >
                              {savedIds.has(sub.id) ? "✓" : "+"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PRONUNCIATION */}
            {tab === "pronunciation" && (
              <PronunciationTab subtitles={video.subtitles} />
            )}

            {/* DICTATION */}
            {tab === "dictation" && (
              <div className="max-w-lg mx-auto">
                {video.subtitles.length === 0 ? (
                  <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">Video này chưa có subtitle để luyện chép chính tả.</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Nghe đoạn tại <span className="mono text-[var(--foreground)]">{formatTime(dictSub.start)}</span> rồi chép lại
                      </p>
                      <div className="flex gap-2">
                        <button disabled={dictSubIdx === 0} onClick={() => { setDictSubIdx(i => i - 1); setDictInput(""); setDictChecked(false); }} className="text-xs px-2 py-1 bg-[var(--secondary)] rounded disabled:opacity-30">← Trước</button>
                        <button disabled={dictSubIdx >= video.subtitles.length - 1} onClick={() => { setDictSubIdx(i => i + 1); setDictInput(""); setDictChecked(false); }} className="text-xs px-2 py-1 bg-[var(--secondary)] rounded disabled:opacity-30">Sau →</button>
                      </div>
                    </div>
                    <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-4 mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)]">Đoạn {dictSubIdx + 1} / {video.subtitles.length}</div>
                        <div className="mono text-xs text-[var(--accent)] mt-0.5">{formatTime(dictSub.start)} — {formatTime(dictSub.end)}</div>
                      </div>
                      <div className="text-2xl">🎧</div>
                    </div>
                    <textarea
                      value={dictInput}
                      onChange={(e) => { setDictInput(e.target.value); setDictChecked(false); }}
                      rows={3}
                      placeholder="Chép lại những gì bạn nghe được..."
                      className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] resize-none mb-3 transition-colors"
                    />
                    <button onClick={() => setDictChecked(true)} disabled={!dictInput.trim()} className="w-full py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                      Kiểm tra đáp án
                    </button>
                    {dictChecked && (
                      <div className="mt-4 bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-xs text-[var(--muted-foreground)] mb-2">Đáp án đúng:</div>
                        <div className="text-xs text-[var(--foreground)] mb-3 font-medium leading-relaxed">{dictSub.en}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {dictSub.en.split(/\s+/).map((w, i) => {
                            const userWords = dictInput.split(/\s+/);
                            const correct = userWords[i]?.toLowerCase().replace(/[^a-z]/g, "") === w.toLowerCase().replace(/[^a-z]/g, "");
                            return (
                              <span key={i} className={`text-sm px-1.5 py-0.5 rounded-md ${correct ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>{w}</span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TRANSCRIBE */}
            {tab === "transcribe" && (
              <div className="max-w-lg mx-auto">
                {video.subtitles.length === 0 ? (
                  <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">Video này chưa có subtitle để luyện.</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-[var(--muted-foreground)]">Nhìn nghĩa tiếng Việt, viết lại câu tiếng Anh</p>
                      <div className="flex gap-2">
                        <button disabled={transSubIdx === 0} onClick={() => { setTransSubIdx(i => i - 1); setTransInput(""); setTransChecked(false); }} className="text-xs px-2 py-1 bg-[var(--secondary)] rounded disabled:opacity-30">← Trước</button>
                        <button disabled={transSubIdx >= video.subtitles.length - 1} onClick={() => { setTransSubIdx(i => i + 1); setTransInput(""); setTransChecked(false); }} className="text-xs px-2 py-1 bg-[var(--secondary)] rounded disabled:opacity-30">Sau →</button>
                      </div>
                    </div>
                    <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-4 mb-4">
                      <div className="text-xs text-[var(--muted-foreground)] mb-1.5">Nghĩa tiếng Việt:</div>
                      <p className="text-sm text-[var(--accent)] font-medium leading-relaxed">{transSub.vi}</p>
                    </div>
                    <textarea
                      value={transInput}
                      onChange={(e) => { setTransInput(e.target.value); setTransChecked(false); }}
                      rows={3}
                      placeholder="Viết câu tiếng Anh tương ứng..."
                      className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] resize-none mb-3 transition-colors"
                    />
                    <button onClick={() => setTransChecked(true)} disabled={!transInput.trim()} className="w-full py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                      Kiểm tra
                    </button>
                    {transChecked && (
                      <div className="mt-4 bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-xs text-[var(--muted-foreground)] mb-2">Câu đúng:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {transSub.en.split(/\s+/).map((w, i) => {
                            const userWords = transInput.split(/\s+/);
                            const correct = userWords[i]?.toLowerCase().replace(/[^a-z]/g, "") === w.toLowerCase().replace(/[^a-z]/g, "");
                            return (
                              <span key={i} className={`text-sm px-1.5 py-0.5 rounded-md ${correct ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>{w}</span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Saved sentences panel */}
        {savedIds.size > 0 && (
          <div className="w-56 flex-shrink-0 border-l border-[var(--border)] bg-[var(--card)] overflow-y-auto p-3">
            <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest mb-2">Đã lưu ({savedIds.size})</h3>
            <div className="flex flex-col gap-2">
              {video.subtitles
                .filter((s) => savedIds.has(s.id))
                .map((s) => (
                  <div key={s.id} className="bg-[var(--secondary)] rounded-lg p-2.5">
                    <p className="text-xs text-[var(--foreground)] leading-relaxed">{s.en}</p>
                    <p className="text-[10px] text-[var(--accent)] mt-1">{s.vi}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
