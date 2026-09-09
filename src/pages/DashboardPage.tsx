import { defaultVideos as videos, vocabulary, phrases, collectionWords } from "../data";
import { type Page } from "../App";

type Props = { navigate: (p: Page, id?: string) => void };

const dueToday = vocabulary.filter((w) => w.nextReview <= "2026-08-30");
const newWordsToday = collectionWords.filter((w) => w.level === 0).slice(0, 5);

const tips = [
  "Học ít nhưng đều đặn mỗi ngày hiệu quả hơn học nhiều một lần.",
  "Shadowing — nghe và nói theo video — là cách nhanh nhất để cải thiện phát âm.",
  "Học từ vựng theo ngữ cảnh giúp nhớ lâu hơn học từng từ đơn lẻ.",
  "Mỗi tuần cố gắng học thuộc 3–5 câu giao tiếp thông dụng mới.",
  "Luyện phản xạ 5 phút mỗi ngày giúp tư duy bằng tiếng Anh nhanh hơn.",
];
const todayTip = tips[new Date().getDay() % tips.length];

export default function DashboardPage({ navigate }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-[var(--foreground)] mb-1" style={{ fontFamily: "Outfit,sans-serif" }}>Xin chào! 👋</h1>
            <p className="text-[var(--muted-foreground)] text-sm">Hãy duy trì thói quen học mỗi ngày để đạt kết quả tốt nhất.</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-right">
            <div className="text-xs text-[var(--muted-foreground)] mb-0.5">Streak hiện tại</div>
            <div className="text-xl font-black text-orange-400">🔥 7 ngày</div>
          </div>
        </div>

        {/* Tip of the day */}
        <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 rounded-xl p-4 mb-7 flex items-start gap-3">
          <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
          <div>
            <div className="text-xs font-semibold text-[var(--primary)] mb-1 uppercase tracking-wider">Mẹo học hôm nay</div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">{todayTip}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {[
            { label: "Từ đã học", value: vocabulary.length, sub: "trong bộ sưu tập", color: "var(--primary)", icon: "◈" },
            { label: "Video đã xem", value: 12, sub: "tuần này", color: "var(--accent)", icon: "▶" },
            { label: "Đến hạn ôn", value: dueToday.length, sub: "từ hôm nay", color: "#f59e0b", icon: "◷" },
            { label: "Câu đã lưu", value: phrases.filter(p => p.saved).length, sub: "trong bộ sưu tập", color: "#f472b6", icon: "❝" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg" style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div className="text-3xl font-black mb-0.5" style={{ color: stat.color, fontFamily: "Outfit,sans-serif" }}>{stat.value}</div>
              <div className="text-xs font-medium text-[var(--foreground)]">{stat.label}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Today's tasks */}
          <div className="col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h2 className="text-sm font-bold mb-4 text-[var(--foreground)]">Kế hoạch hôm nay</h2>
            <div className="flex flex-col gap-2.5">
              {[
                {
                  label: `Học ${newWordsToday.length} từ mới`,
                  desc: "Từ bộ sưu tập 1000 từ thông dụng",
                  xp: 40, done: false, page: "review" as Page,
                  badge: "🌱 Từ mới"
                },
                {
                  label: `Ôn ${dueToday.length} từ đến hạn`,
                  desc: "Spaced repetition — không bỏ qua!",
                  xp: 30, done: false, page: "review" as Page,
                  badge: "🔄 Ôn tập"
                },
                {
                  label: "Xem 1 video và luyện phát âm",
                  desc: "Dùng mic chấm điểm từng câu",
                  xp: 50, done: false, page: "videos" as Page,
                  badge: "🎤 Phát âm"
                },
                {
                  label: "Luyện phản xạ 5 phút",
                  desc: "Đọc câu tiếng Anh không cần dịch",
                  xp: 25, done: false, page: "reflex" as Page,
                  badge: "⚡ Phản xạ"
                },
              ].map((task) => (
                <button
                  key={task.label}
                  onClick={() => navigate(task.page)}
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-[var(--secondary)] hover:bg-[var(--muted)] transition-colors text-left border border-transparent hover:border-[var(--border)] group"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--border)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--primary)] transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--foreground)]">{task.label}</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{task.desc}</div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs mono text-[var(--primary)] font-semibold">+{task.xp} XP</div>
                    <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{task.badge}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Learning path */}
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="text-xs font-bold text-[var(--foreground)] mb-3 uppercase tracking-wider">Từ vựng gần đây</h3>
              <div className="flex flex-col gap-2">
                {vocabulary.slice(0, 5).map((w) => (
                  <button key={w.id} onClick={() => navigate("vocabulary")} className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.level >= 4 ? "bg-green-400" : w.level >= 3 ? "bg-blue-400" : w.level >= 2 ? "bg-yellow-400" : "bg-red-400"}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[var(--foreground)]">{w.word}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] ml-1.5 truncate">{w.meaning.slice(0, 20)}…</span>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => navigate("vocabulary")} className="mt-3 text-xs text-[var(--accent)] hover:underline">Xem tất cả →</button>
            </div>

            {/* Quick access */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="text-xs font-bold text-[var(--foreground)] mb-3 uppercase tracking-wider">Truy cập nhanh</h3>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { label: "Phát âm", icon: "🎤", page: "videos" as Page },
                  { label: "Ôn từ", icon: "📚", page: "review" as Page },
                  { label: "Phản xạ", icon: "⚡", page: "reflex" as Page },
                  { label: "Câu hay", icon: "❝", page: "phrases" as Page },
                ] as const).map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.page)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-[var(--secondary)] hover:bg-[var(--muted)] transition-colors text-center"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Continue watching */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Tiếp tục xem</h2>
            <button onClick={() => navigate("videos")} className="text-xs text-[var(--accent)] hover:underline">Xem tất cả →</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {videos.slice(0, 3).map((v: (typeof videos)[0]) => (
              <button
                key={v.id}
                onClick={() => navigate("video-detail", v.id)}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden text-left hover:border-[var(--accent)] transition-all group hover:shadow-lg hover:shadow-black/10"
              >
                <div className="relative bg-[var(--muted)]">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg">
                      <span className="text-[var(--primary-foreground)] pl-0.5">▶</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] mono px-1.5 py-0.5 rounded">{v.duration}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs font-semibold text-[var(--foreground)] line-clamp-2 leading-snug">{v.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
