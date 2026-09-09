import { useState } from "react";
import { defaultVideos, defaultChannels, topics, type Video, type Channel } from "../data";
import { type Page } from "../App";

type Props = { navigate: (p: Page, id?: string) => void };
type ModalType = "none" | "add-video" | "add-channel";

function parseYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseChannelHandle(url: string): string | null {
  const patterns = [
    /youtube\.com\/@([^/?&]+)/,
    /youtube\.com\/channel\/([^/?&]+)/,
    /youtube\.com\/c\/([^/?&]+)/,
    /^@?([a-zA-Z0-9_.-]{3,})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1].replace(/^@/, "");
  }
  return null;
}

export default function VideosPage({ navigate }: Props) {
  const [videos, setVideos] = useState<Video[]>(defaultVideos);
  const [channels, setChannels] = useState<Channel[]>(defaultChannels);
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterChannel, setFilterChannel] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalType>("none");

  // Add video form
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoTopic, setVideoTopic] = useState(topics[0].id);
  const [videoChannel, setVideoChannel] = useState(channels[0]?.id ?? "");
  const [videoError, setVideoError] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);

  // Add channel form
  const [channelUrl, setChannelUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelError, setChannelError] = useState("");

  const filtered = videos.filter((v) => {
    const matchTopic = filterTopic === "all" || v.topicId === filterTopic;
    const matchChannel = filterChannel === "all" || v.channelId === filterChannel;
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    return matchTopic && matchChannel && matchSearch;
  });

  const handleAddVideo = () => {
    setVideoError("");
    const ytId = parseYoutubeId(videoUrl.trim());
    if (!ytId) { setVideoError("Không tìm thấy YouTube video ID. Hãy kiểm tra lại đường dẫn."); return; }
    if (!videoTitle.trim()) { setVideoError("Vui lòng nhập tiêu đề video."); return; }
    if (videos.some((v) => v.youtubeId === ytId)) { setVideoError("Video này đã có trong thư viện."); return; }

    setAddingVideo(true);
    setTimeout(() => {
      const channelObj = channels.find((c) => c.id === videoChannel) || channels[0];
      const newVideo: Video = {
        id: `v${Date.now()}`,
        youtubeId: ytId,
        title: videoTitle.trim(),
        topicId: videoTopic,
        channelId: channelObj?.id ?? "c1",
        duration: "—",
        thumbnail: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`,
        subtitles: [],
      };
      setVideos((prev) => [newVideo, ...prev]);
      setVideoUrl("");
      setVideoTitle("");
      setModal("none");
      setAddingVideo(false);
    }, 600);
  };

  const handleAddChannel = () => {
    setChannelError("");
    const handle = parseChannelHandle(channelUrl.trim());
    if (!handle) { setChannelError("Không nhận diện được kênh YouTube. Hãy nhập đúng URL hoặc @handle."); return; }
    if (!channelName.trim()) { setChannelError("Vui lòng nhập tên kênh."); return; }
    if (channels.some((c) => c.name.toLowerCase() === channelName.trim().toLowerCase())) {
      setChannelError("Kênh này đã được thêm."); return;
    }

    const initials = channelName.trim().split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
    const newChannel: Channel = {
      id: `ch${Date.now()}`,
      name: channelName.trim(),
      avatar: initials,
      youtubeChannelId: handle,
    };
    setChannels((prev) => [...prev, newChannel]);
    setChannelUrl("");
    setChannelName("");
    setModal("none");
  };

  const closeModal = () => {
    setModal("none");
    setVideoError("");
    setChannelError("");
    setVideoUrl("");
    setVideoTitle("");
    setChannelUrl("");
    setChannelName("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Video Library</h1>
            <p className="text-sm text-[var(--muted-foreground)]">{videos.length} videos · {channels.length} channels</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal("add-channel")}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--secondary)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors border border-[var(--border)]"
            >
              + Add Channel
            </button>
            <button
              onClick={() => setModal("add-video")}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              + Add Video
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] w-56 transition-colors"
          />
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          >
            <option value="all">All Topics</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          >
            <option value="all">All Channels</option>
            {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Topic chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterTopic("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterTopic === "all" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
          >
            All Topics
          </button>
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterTopic(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterTopic === t.id ? "text-black" : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
              style={filterTopic === t.id ? { backgroundColor: t.color } : {}}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Channel pills */}
        {channels.length > 4 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {channels.slice(4).map((c) => (
              <span key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--secondary)] rounded-full text-xs text-[var(--muted-foreground)]">
                <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[8px] font-bold flex items-center justify-center">{c.avatar}</span>
                {c.name}
                {c.youtubeChannelId && <span className="text-[var(--primary)] text-[9px]">✓ synced</span>}
              </span>
            ))}
          </div>
        )}

        {/* Video grid */}
        <div className="grid grid-cols-2 gap-5">
          {filtered.map((v) => {
            const topic = topics.find((t) => t.id === v.topicId);
            const channel = channels.find((c) => c.id === v.channelId);
            return (
              <button
                key={v.id}
                onClick={() => navigate("video-detail", v.id)}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden text-left hover:border-[var(--accent)] transition-all group hover:shadow-lg hover:shadow-black/10"
              >
                <div className="relative bg-[var(--muted)]">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-xl">
                      <span className="text-[var(--primary-foreground)]">▶</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs mono px-1.5 py-0.5 rounded">{v.duration}</div>
                  {topic && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium text-black" style={{ backgroundColor: topic.color }}>{topic.name}</div>
                  )}
                  {v.subtitles.length === 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] px-2 py-0.5 rounded-full font-medium">No subs</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug mb-2 line-clamp-2">{v.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-[9px] font-bold text-white">{channel?.avatar ?? "?"}</div>
                    <span className="text-xs text-[var(--muted-foreground)]">{channel?.name ?? "Unknown"}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <div className="text-4xl mb-3">🎬</div>
            <p>No videos match your filters.</p>
          </div>
        )}
      </div>

      {/* ---- ADD VIDEO MODAL ---- */}
      {modal === "add-video" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Add YouTube Video</h2>
              <button onClick={closeModal} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)]">✕</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">YouTube URL hoặc Video ID <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=... hoặc dán video ID"
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); setVideoError(""); }}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
                />
                {videoUrl && !parseYoutubeId(videoUrl) && (
                  <p className="text-xs text-yellow-400 mt-1">⚠ Chưa nhận diện được ID video</p>
                )}
                {videoUrl && parseYoutubeId(videoUrl) && (
                  <p className="text-xs text-[var(--primary)] mt-1">✓ ID: <span className="mono">{parseYoutubeId(videoUrl)}</span></p>
                )}
              </div>

              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">Tiêu đề video <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề video..."
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">Chủ đề</label>
                  <select value={videoTopic} onChange={(e) => setVideoTopic(e.target.value)} className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]">
                    {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">Kênh</label>
                  <select value={videoChannel} onChange={(e) => setVideoChannel(e.target.value)} className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]">
                    {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Thumbnail preview */}
              {parseYoutubeId(videoUrl) && (
                <div className="rounded-lg overflow-hidden bg-[var(--muted)] h-28 relative">
                  <img
                    src={`https://img.youtube.com/vi/${parseYoutubeId(videoUrl)}/mqdefault.jpg`}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm pl-0.5">▶</span>
                    </div>
                  </div>
                </div>
              )}

              {videoError && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{videoError}</p>}

              <button
                onClick={handleAddVideo}
                disabled={addingVideo}
                className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {addingVideo ? "Đang thêm..." : "Thêm vào thư viện"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- ADD CHANNEL MODAL ---- */}
      {modal === "add-channel" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Add YouTube Channel</h2>
              <button onClick={closeModal} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)]">✕</button>
            </div>

            <div className="bg-[var(--secondary)] rounded-xl p-3 mb-4 text-xs text-[var(--muted-foreground)] leading-relaxed">
              💡 Sau khi thêm kênh, bạn có thể thêm các video từ kênh đó vào thư viện theo từng video hoặc theo từng đợt.
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">URL hoặc @handle của kênh <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="https://youtube.com/@ChannelName hoặc @handle"
                  value={channelUrl}
                  onChange={(e) => { setChannelUrl(e.target.value); setChannelError(""); }}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
                />
                {channelUrl && parseChannelHandle(channelUrl) && (
                  <p className="text-xs text-[var(--primary)] mt-1">✓ Handle: <span className="mono">@{parseChannelHandle(channelUrl)}</span></p>
                )}
              </div>

              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">Tên kênh <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. BBC Learning English"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              {channelError && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{channelError}</p>}

              <button
                onClick={handleAddChannel}
                className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Thêm kênh
              </button>
            </div>

            {/* Existing channels list */}
            {channels.length > 0 && (
              <div className="mt-5 border-t border-[var(--border)] pt-4">
                <p className="text-xs text-[var(--muted-foreground)] mb-3">Kênh đã thêm ({channels.length})</p>
                <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
                  {channels.map((c) => (
                    <div key={c.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--secondary)]">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{c.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[var(--foreground)] truncate">{c.name}</div>
                        {c.youtubeChannelId && <div className="text-[10px] mono text-[var(--muted-foreground)]">@{c.youtubeChannelId}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
