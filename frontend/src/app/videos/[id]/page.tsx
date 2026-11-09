"use client";
import { getUserKey, API_URL, speakEnglish, lookupWordDictionary, saveSrsWord } from "../../../utils/storage";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import YouTube, { YouTubeProps } from "react-youtube";
import axios from "axios";

type Subtitle = {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  translation: string | null;
};

type Video = {
  id: number;
  youtubeId: string;
  title: string;
  subtitles: Subtitle[];
};

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<"subtitles" | "pronunciation" | "dictation">("subtitles");
  const activeTabRef = useRef<"subtitles" | "pronunciation" | "dictation">("subtitles");

  // Segment-only playback control (for Dictation & Pronunciation/Shadowing tabs)
  const segmentBoundsRef = useRef<{ start: number; end: number; subId: number } | null>(null);
  const [loopSegment, setLoopSegment] = useState(false);
  const loopSegmentRef = useRef(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Word lookup popup when user clicks an English word in subtitles
  const [selectedWordInfo, setSelectedWordInfo] = useState<{
    word: string;
    phonetic: string;
    translation: string;
    definitionEn: string;
    example: string;
    loading: boolean;
    saved: boolean;
  } | null>(null);

  // User state
  const [user, setUser] = useState<any>(null);
  const [startSeconds, setStartSeconds] = useState(0);

  // Auto-scroll logic
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Dictation State
  const [dictationInput, setDictationInput] = useState("");
  const [dictationResultMap, setDictationResultMap] = useState<Record<number, any[]>>({});
  const [dictationShowHint, setDictationShowHint] = useState<Record<number, boolean>>({});

  // Pronunciation State
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [pronunciationTranscripts, setPronunciationTranscripts] = useState<Record<number, any[]>>({});
  const recognitionRef = useRef<any>(null);

  // Save / Translate
  const [savedPhrases, setSavedPhrases] = useState<Record<number, boolean>>({});
  const [translating, setTranslating] = useState<Record<number, boolean>>({});

  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const progressSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    activeTabRef.current = activeTab;
    // Clear segment boundary when returning to full subtitles viewing mode
    if (activeTab === "subtitles") {
      segmentBoundsRef.current = null;
    }
  }, [activeTab]);

  useEffect(() => {
    loopSegmentRef.current = loopSegment;
  }, [loopSegment]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (id) {
      axios
        .get(`${API_URL}/videos/${id}`)
        .then(async (res) => {
          const data = res.data;
          let subs: Subtitle[] = (data.subtitles || []).sort((a: Subtitle, b: Subtitle) => a.startTime - b.startTime);

          // If backend returned 0 subtitles, fetch directly from Next.js /api/transcript route
          if (subs.length === 0 && data.youtubeId) {
            try {
              const trRes = await axios.get(`/api/transcript?videoId=${data.youtubeId}`);
              if (Array.isArray(trRes.data?.transcript) && trRes.data.transcript.length > 0) {
                subs = trRes.data.transcript.map((item: any, idx: number, arr: any[]) => {
                  const startTime = Number(item.offset) / 1000;
                  const rawEnd = (Number(item.offset) + Number(item.duration)) / 1000;
                  const nextStart = idx < arr.length - 1 ? Number(arr[idx + 1].offset) / 1000 : rawEnd;
                  const endTime = Math.max(startTime + 0.3, Math.min(rawEnd, nextStart));
                  return {
                    id: idx + 1,
                    startTime: isNaN(startTime) ? 0 : startTime,
                    endTime: isNaN(endTime) ? 2.5 : endTime,
                    text: String(item.text || "").trim(),
                    translation: null,
                  };
                });
              }
            } catch (trErr) {
              console.warn("Fallback /api/transcript failed:", trErr);
            }
          }

          data.subtitles = subs;
          setVideo(data);
        })
        .catch((e) => {
          console.error(e);
          router.push("/videos");
        });
    }
  }, [id, router]);

  // Load progress
  useEffect(() => {
    if (video && user) {
      axios
        .get(`${API_URL}/users/${user.id}/progress/video/${video.id}`)
        .then((res) => {
          if (res.data && res.data.progressPercent) {
            setStartSeconds(res.data.progressPercent);
          }
        })
        .catch(console.error);
    }
  }, [video, user]);

  // High-precision progress & segment-stop loop
  useEffect(() => {
    let animationFrameId: number;
    const trackTime = () => {
      if (player && typeof player.getCurrentTime === "function") {
        try {
          const t = player.getCurrentTime();
          setCurrentTime(t);

          // Enforce single-subtitle playback on Pronunciation & Dictation tabs
          if (
            (activeTabRef.current === "pronunciation" || activeTabRef.current === "dictation") &&
            segmentBoundsRef.current !== null
          ) {
            const bounds = segmentBoundsRef.current;
            if (t >= bounds.end - 0.04) {
              if (loopSegmentRef.current) {
                player.seekTo(bounds.start, true);
                player.playVideo();
              } else {
                player.pauseVideo();
                segmentBoundsRef.current = null;
              }
            }
          }
        } catch (e) {}
      }
      animationFrameId = requestAnimationFrame(trackTime);
    };

    if (player) {
      animationFrameId = requestAnimationFrame(trackTime);

      progressSaveTimer.current = setInterval(() => {
        if (user && video && typeof player.getCurrentTime === "function") {
          try {
            axios
              .post(`${API_URL}/users/${user.id}/progress/video/${video.id}`, {
                progressPercent: player.getCurrentTime(),
                progressTime: player.getCurrentTime(),
              })
              .catch(() => {});
          } catch (e) {}
        }
      }, 10000);
    }
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (progressSaveTimer.current) clearInterval(progressSaveTimer.current);
    };
  }, [player, user, video]);

  const hasSeeked = useRef(false);
  useEffect(() => {
    if (player && startSeconds > 0 && !hasSeeked.current) {
      try {
        player.seekTo(startSeconds, true);
      } catch (err) {
        console.warn("YouTube player seekTo failed:", err);
      }
      hasSeeked.current = true;
    }
  }, [player, startSeconds]);

  useEffect(() => {
    if (!video) return;
    // In pronunciation or dictation tab, keep activeSubtitleIndex locked on the clicked segment unless playing naturally
    if (
      (activeTab === "pronunciation" || activeTab === "dictation") &&
      segmentBoundsRef.current === null &&
      activeSubtitleIndex !== -1
    ) {
      return;
    }
    const index = video.subtitles.findIndex((s) => currentTime >= s.startTime && currentTime < s.endTime);
    if (index !== -1 && index !== activeSubtitleIndex) {
      setActiveSubtitleIndex(index);
    }
  }, [currentTime, video, activeSubtitleIndex, activeTab]);

  useEffect(() => {
    if (video && video.subtitles.length > 0) {
      const untranslated = video.subtitles.filter((s) => !s.translation);
      if (untranslated.length > 0) {
        const chunkSize = 200;
        const chunks: any[] = [];
        for (let i = 0; i < untranslated.length; i += chunkSize) {
          chunks.push(untranslated.slice(i, i + chunkSize));
        }

        const translateChunks = async () => {
          const newVideo = { ...video };
          for (const chunk of chunks) {
            const texts = chunk.map((s: any) => s.text);
            try {
              const res = await axios.post(`${API_URL}/videos/translate`, { text: texts.join("\n") });
              const translatedTexts = (res.data.text || "").split("\n");
              let j = 0;
              newVideo.subtitles = newVideo.subtitles.map((s) => {
                if (!s.translation && chunk.find((c: any) => c.id === s.id)) {
                  s.translation = translatedTexts[j] || "Lỗi dịch thuật";
                  j++;
                }
                return s;
              });
              setVideo({ ...newVideo });
            } catch (e) {
              console.error("Batch translate failed", e);
            }
          }
          axios.put(`${API_URL}/videos/${video.id}/subtitles`, { subtitles: newVideo.subtitles }).catch(() => {});
        };
        translateChunks();
      }
    }
  }, [video?.id]);

  const isAutoScrolling = useRef(false);

  useEffect(() => {
    if (autoScroll && activeSubtitleIndex !== -1 && activeItemRef.current && listRef.current) {
      const container = listRef.current;
      const item = activeItemRef.current;
      const containerHeight = container.clientHeight;
      const itemTop = item.offsetTop;
      const itemHeight = item.clientHeight;

      isAutoScrolling.current = true;
      container.scrollTo({
        top: itemTop - containerHeight / 2 + itemHeight / 2,
        behavior: "smooth",
      });
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 600);
    }
  }, [activeSubtitleIndex, autoScroll]);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    setPlayer(event.target);
  };

  // Continuous playback seek (used on Subtitles tab)
  const seekTo = (time: number, index?: number) => {
    segmentBoundsRef.current = null;
    if (typeof index === "number") setActiveSubtitleIndex(index);
    if (player) {
      try {
        player.seekTo(time, true);
        player.playVideo();
      } catch (err) {
        console.warn("YouTube player seekTo failed:", err);
      }
      setAutoScroll(true);
    }
  };

  // Segment-bounded playback (used on Pronunciation & Dictation tabs)
  // Plays ONLY from sub.startTime to sub.endTime, then automatically pauses!
  const playSubtitleSegment = (sub: Subtitle, index: number) => {
    const safeEnd = Math.max(sub.startTime + 0.8, sub.endTime);
    segmentBoundsRef.current = {
      start: sub.startTime,
      end: safeEnd,
      subId: sub.id,
    };
    setActiveSubtitleIndex(index);
    if (player) {
      try {
        player.seekTo(sub.startTime, true);
        player.playVideo();
      } catch (err) {
        console.warn("YouTube player playSubtitleSegment failed:", err);
      }
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackSpeed(rate);
    if (player && typeof player.setPlaybackRate === "function") {
      try {
        player.setPlaybackRate(rate);
      } catch (e) {}
    }
  };

  const handleWordClick = async (rawWord: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleaned = rawWord.replace(/[^a-zA-Z'-]/g, "").trim();
    if (!cleaned || cleaned.length < 2) return;

    if (player && typeof player.pauseVideo === "function") {
      try {
        player.pauseVideo();
      } catch {}
    }

    speakEnglish(cleaned);
    setSelectedWordInfo({
      word: cleaned,
      phonetic: `/${cleaned.toLowerCase()}/`,
      translation: "Đang tra nghĩa...",
      definitionEn: "",
      example: "",
      loading: true,
      saved: false,
    });

    const [dict, transRes] = await Promise.all([
      lookupWordDictionary(cleaned),
      axios.post(`${API_URL}/videos/translate`, { text: cleaned }).catch(() => ({ data: { text: "Từ vựng tiếng Anh" } })),
    ]);

    setSelectedWordInfo({
      word: cleaned,
      phonetic: dict.phonetic,
      translation: transRes.data?.text || "Từ vựng thông dụng",
      definitionEn: dict.definitionEn || "",
      example: dict.example || "",
      loading: false,
      saved: false,
    });
  };

  const handleSaveSelectedWord = () => {
    if (!selectedWordInfo) return;
    const savedWords = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    const newWord = {
      id: Date.now(),
      word: selectedWordInfo.word.toLowerCase(),
      phonetic: selectedWordInfo.phonetic,
      translation: selectedWordInfo.translation,
      definition: selectedWordInfo.example || selectedWordInfo.definitionEn,
    };
    if (!savedWords.some((w: any) => w.word.toLowerCase() === newWord.word)) {
      savedWords.unshift(newWord);
      localStorage.setItem(getUserKey("savedWords"), JSON.stringify(savedWords));
    }
    saveSrsWord(newWord, "good");
    setSelectedWordInfo({ ...selectedWordInfo, saved: true });
  };

  const handleManualScroll = () => {
    if (isAutoScrolling.current) return;
    handleUserInteraction();
  };

  const handleUserInteraction = () => {
    setAutoScroll(false);
    if (autoScrollTimer.current) clearTimeout(autoScrollTimer.current);
    autoScrollTimer.current = setTimeout(() => {
      setAutoScroll(true);
    }, 4000);
  };

  const handleTranslate = async (sub: Subtitle, index: number) => {
    setTranslating((prev) => ({ ...prev, [sub.id]: true }));
    try {
      const res = await axios.post(`${API_URL}/videos/translate`, { text: sub.text });
      if (video) {
        const newVideo = { ...video };
        newVideo.subtitles[index].translation = res.data.text;
        setVideo(newVideo);
      }
    } catch (e) {
      console.error(e);
    }
    setTranslating((prev) => ({ ...prev, [sub.id]: false }));
  };

  const handleSavePhrase = async (sub: Subtitle) => {
    if (!user) return alert("Vui lòng đăng nhập để lưu câu!");
    try {
      await axios.post(`${API_URL}/phrases`, {
        userId: user.id,
        videoId: video!.id,
        text: sub.text,
        translation: sub.translation,
        startTime: sub.startTime,
        endTime: sub.endTime,
      });
      setSavedPhrases((prev) => ({ ...prev, [sub.id]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRecording = (sub: Subtitle) => {
    if (isRecording === sub.id && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(null);
    } else {
      if (player) {
        try {
          player.pauseVideo();
        } catch (e) {}
      }
      segmentBoundsRef.current = null;
      setIsRecording(sub.id);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome, Edge hoặc Safari.");
        setIsRecording(null);
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript + interim;
        const origWords = sub.text
          .replace(/[^\w\s']/g, "")
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);
        const spokenWords = currentText
          .replace(/[^\w\s']/g, "")
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);

        let correctCount = 0;
        const diff = origWords.map((w) => {
          if (spokenWords.includes(w)) {
            correctCount++;
            return { text: w, status: "good" };
          }
          return { text: w, status: "bad" };
        });

        setPronunciationTranscripts((prev) => ({ ...prev, [sub.id]: diff }));
        setScores((prev) => ({ ...prev, [sub.id]: Math.round((correctCount / Math.max(1, origWords.length)) * 100) || 0 }));
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(null);
      };

      recognition.onend = () => {
        setIsRecording(null);
      };

      recognition.start();
    }
  };

  const checkDictationAdv = (subId: number, subText: string) => {
    const origWords = subText
      .replace(/[^\w\s']/g, "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const spokenWords = dictationInput
      .replace(/[^\w\s']/g, "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    let correctCount = 0;
    const diff = origWords.map((w) => {
      if (spokenWords.includes(w)) {
        correctCount++;
        return { text: w, status: "good" };
      }
      return { text: w, status: "bad" };
    });
    setDictationResultMap((prev) => ({ ...prev, [subId]: diff }));
  };

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (video) {
      const savedIds = JSON.parse(localStorage.getItem(getUserKey("savedVideoIds")) || "[]");
      setIsSaved(savedIds.includes(video.id));
    }
  }, [video]);

  const toggleSaveVideo = () => {
    if (!video) return;
    const savedIds = JSON.parse(localStorage.getItem(getUserKey("savedVideoIds")) || "[]");
    if (isSaved) {
      const updated = savedIds.filter((vId: number) => vId !== video.id);
      localStorage.setItem(getUserKey("savedVideoIds"), JSON.stringify(updated));
      setIsSaved(false);
    } else {
      savedIds.push(video.id);
      localStorage.setItem(getUserKey("savedVideoIds"), JSON.stringify(savedIds));
      setIsSaved(true);
    }
  };

  if (!video) return <div className="p-8 text-white">Đang tải video...</div>;

  return (
    <div className="w-full h-full flex flex-col bg-[#1E1E24] text-white overflow-hidden pb-16 md:pb-0">
      {/* HEADER & VIDEO (Top Section) */}
      <div className="w-full relative flex flex-col items-center bg-black shrink-0">
        <div className="w-full flex items-center justify-between px-3 py-2 md:p-4 text-gray-300 bg-black/90 md:bg-gradient-to-b md:from-black/80 md:to-transparent md:absolute md:top-0 md:left-0 z-10">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button
              onClick={() => router.push("/videos")}
              className="hover:text-white flex items-center gap-1 text-xs md:text-sm font-medium shrink-0 bg-white/10 px-2.5 py-1 rounded-lg"
            >
              ← Thư viện
            </button>
            <span className="font-semibold text-white truncate text-xs md:text-base max-w-[200px] sm:max-w-md md:max-w-lg">
              {video.title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => changeSpeed(playbackSpeed === 1 ? 0.75 : playbackSpeed === 0.75 ? 0.5 : 1)}
              className="text-xs px-2.5 py-1 rounded-full font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15"
              title="Tốc độ phát"
            >
              🐢 {playbackSpeed}x
            </button>
            <button
              onClick={toggleSaveVideo}
              className={`text-white text-xs px-3 py-1 rounded-full font-medium transition-colors border ${
                isSaved
                  ? "bg-red-500/80 hover:bg-red-600 border-red-400/50"
                  : "bg-[#00D084]/80 hover:bg-[#00D084] border-[#00D084]/50"
              }`}
            >
              {isSaved ? "✕ Bỏ lưu" : "⭐ Lưu"}
            </button>
          </div>
        </div>

        <div className="w-full max-w-4xl aspect-video max-h-[34vh] md:max-h-[42vh] relative group overflow-hidden bg-black">
          <YouTube
            videoId={video.youtubeId}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 1,
                rel: 0,
                modestbranding: 1,
                controls: 1,
                playsinline: 1,
              },
            }}
            className="absolute inset-0 w-full h-full"
            onReady={onPlayerReady}
          />
        </div>
      </div>

      {/* WORD DICTIONARY POPUP BAR (When user taps any word in subtitle) */}
      {selectedWordInfo && (
        <div className="bg-[#252538] border-y border-[#00D084]/40 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => speakEnglish(selectedWordInfo.word)}
              className="w-9 h-9 rounded-full bg-[#00D084]/20 text-[#00D084] flex items-center justify-center shrink-0 hover:bg-[#00D084]/30"
            >
              🔊
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-base">{selectedWordInfo.word}</span>
                <span className="text-xs text-gray-400 font-mono">{selectedWordInfo.phonetic}</span>
                <span className="text-sm font-semibold text-[#00D084]">→ {selectedWordInfo.translation}</span>
              </div>
              {selectedWordInfo.definitionEn && (
                <p className="text-xs text-gray-300 truncate">{selectedWordInfo.definitionEn}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveSelectedWord}
              disabled={selectedWordInfo.saved}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedWordInfo.saved
                  ? "bg-green-500/20 text-green-400"
                  : "bg-[#00D084] text-black hover:opacity-90"
              }`}
            >
              {selectedWordInfo.saved ? "✓ Đã lưu từ" : "+ Lưu từ vựng"}
            </button>
            <button
              onClick={() => setSelectedWordInfo(null)}
              className="text-gray-400 hover:text-white px-2 py-1 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION (Tabs & Content) */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#1A1A20] border-t border-[#2A2A35]">
        {/* TABS */}
        <div className="flex px-2 md:px-4 border-b border-[#2A2A35] items-center overflow-x-auto no-scrollbar shrink-0">
          <button
            className={`py-3 px-3 md:px-5 font-semibold text-xs md:text-sm transition-colors relative whitespace-nowrap ${
              activeTab === "subtitles" ? "text-[#00D084]" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("subtitles")}
          >
            📄 Phụ đề
            {activeTab === "subtitles" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D084]"></div>}
          </button>
          <button
            className={`py-3 px-3 md:px-5 font-semibold text-xs md:text-sm transition-colors relative whitespace-nowrap ${
              activeTab === "pronunciation" ? "text-[#00D084]" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("pronunciation")}
          >
            🎤 Luyện Shadowing
            {activeTab === "pronunciation" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D084]"></div>}
          </button>
          <button
            className={`py-3 px-3 md:px-5 font-semibold text-xs md:text-sm transition-colors relative whitespace-nowrap ${
              activeTab === "dictation" ? "text-[#00D084]" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("dictation")}
          >
            🎧 Chép chính tả
            {activeTab === "dictation" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D084]"></div>}
          </button>

          <div className="ml-auto flex items-center gap-2 pl-2 shrink-0">
            {(activeTab === "pronunciation" || activeTab === "dictation") && (
              <button
                onClick={() => setLoopSegment(!loopSegment)}
                className={`py-1 px-2.5 rounded-full text-[11px] font-bold border transition-colors ${
                  loopSegment
                    ? "border-amber-400/50 text-amber-300 bg-amber-500/15"
                    : "border-gray-600 text-gray-400"
                }`}
                title="Tự động lặp lại đúng câu đang chọn"
              >
                🔁 {loopSegment ? "Lặp câu: BẬT" : "Chế độ: Từng câu"}
              </button>
            )}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`py-1 px-2.5 rounded-full text-[11px] font-bold border transition-colors ${
                autoScroll
                  ? "border-[#00D084]/30 text-[#00D084] bg-[#00D084]/10"
                  : "border-gray-600 text-gray-400"
              }`}
            >
              {autoScroll ? "Tự cuộn: BẬT" : "Tự cuộn: TẮT"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div
          ref={listRef}
          className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 lg:px-8 max-w-5xl mx-auto w-full relative scroll-smooth"
          onScroll={handleManualScroll}
          onWheel={handleUserInteraction}
          onTouchMove={handleUserInteraction}
        >
          {activeTab === "subtitles" && (
            <>
              <div className="flex justify-between items-center text-xs md:text-sm text-gray-400 mb-3 px-1">
                <span>💡 Chạm vào bất kỳ từ tiếng Anh nào để tra từ điển & lưu từ vựng</span>
                <div className="bg-[#2A2A35] px-2.5 py-1 rounded-full text-xs shrink-0">🇻🇳 + 🇬🇧</div>
              </div>
              <div className="space-y-2.5 pb-20">
                {video.subtitles.map((sub, index) => {
                  const isActive = index === activeSubtitleIndex;
                  return (
                    <div
                      key={sub.id}
                      ref={isActive ? activeItemRef : null}
                      onClick={() => seekTo(sub.startTime, index)}
                      className={`p-3 md:p-4 rounded-xl cursor-pointer transition-colors border flex gap-3 md:gap-4 ${
                        isActive
                          ? "bg-[#252530] border-[#00D084]/60 shadow-md"
                          : "bg-[#1E1E24] border-transparent hover:bg-[#2A2A35]"
                      }`}
                    >
                      <div className="text-xs font-mono text-gray-500 pt-1 shrink-0 w-10 md:w-12">
                        {formatTime(sub.startTime)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-[15px] md:text-[17px] font-medium leading-relaxed flex flex-wrap gap-x-1 ${
                            isActive ? "text-white" : "text-gray-200"
                          }`}
                        >
                          {sub.text.split(/\s+/).map((wordToken, wIdx) => (
                            <span
                              key={wIdx}
                              onClick={(e) => handleWordClick(wordToken, e)}
                              className="hover:text-[#00D084] hover:underline decoration-dotted rounded px-0.5 transition-colors"
                            >
                              {wordToken}
                            </span>
                          ))}
                        </div>
                        <div className={`text-sm md:text-[15px] mt-1 ${isActive ? "text-[#8090C0]" : "text-[#6070A0]"}`}>
                          {sub.translation || (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTranslate(sub, index);
                              }}
                              className="text-xs underline text-blue-400 hover:text-blue-300"
                            >
                              {translating[sub.id] ? "Đang dịch..." : "Dịch sang Tiếng Việt"}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakEnglish(sub.text);
                          }}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors bg-[#2A2A35] text-gray-300 hover:text-white hover:bg-blue-500/20 text-sm"
                          title="Nghe phát âm mẫu"
                        >
                          🔊
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSavePhrase(sub);
                          }}
                          disabled={savedPhrases[sub.id]}
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors text-sm ${
                            savedPhrases[sub.id]
                              ? "bg-green-500/20 text-green-400"
                              : "bg-[#2A2A35] text-gray-300 hover:text-white hover:bg-green-500/20"
                          }`}
                          title="Lưu vào mẫu câu"
                        >
                          {savedPhrases[sub.id] ? "✓" : "💾"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "pronunciation" && (
            <div className="space-y-2.5 pb-20 mt-1">
              <div className="bg-[#252534] border border-[#3A3A4A] rounded-xl p-3 text-xs md:text-sm text-gray-300 flex items-center justify-between">
                <span>
                  🎯 <b>Chế độ Shadowing từng câu:</b> Nhấn vào bất kỳ câu nào để video chỉ phát đúng câu đó rồi tự dừng. Nhấn 🎤 để thu âm và chấm điểm phát âm.
                </span>
              </div>
              {video.subtitles.map((sub, index) => {
                const isActive = index === activeSubtitleIndex;
                const isRec = isRecording === sub.id;
                const score = scores[sub.id];
                const diff = pronunciationTranscripts[sub.id];

                return (
                  <div
                    key={sub.id}
                    ref={isActive ? activeItemRef : null}
                    onClick={() => playSubtitleSegment(sub, index)}
                    className={`p-3 md:p-4 rounded-xl cursor-pointer transition-colors border flex gap-3 md:gap-4 items-center ${
                      isActive
                        ? "bg-[#252530] border-[#00D084] shadow-md"
                        : "bg-[#1E1E24] border-transparent hover:bg-[#2A2A35]"
                    }`}
                  >
                    <div className="text-xs font-mono text-gray-400 shrink-0 w-14 text-center">
                      <div>{formatTime(sub.startTime)}</div>
                      <div className="text-[10px] text-[#00D084] mt-0.5">▶ Nghe câu</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[15px] md:text-[17px] font-medium leading-relaxed ${isActive ? "text-white" : "text-gray-200"}`}>
                        {diff
                          ? diff.map((w, i) => (
                              <span key={i} className={w.status === "good" ? "text-[#00D084]" : "text-red-400 underline"}>
                                {w.text}{" "}
                              </span>
                            ))
                          : sub.text}
                      </div>
                      {sub.translation && (
                        <div className="text-xs md:text-sm text-[#8090C0] mt-1">{sub.translation}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSubtitleSegment(sub, index);
                        }}
                        className="w-9 h-9 rounded-full bg-[#2A2A35] hover:bg-[#3A3A4A] flex items-center justify-center text-xs"
                        title="Phát lại đúng câu này"
                      >
                        🔁
                      </button>
                      {score !== undefined && !isRec && (
                        <div
                          className={`text-sm md:text-base font-bold px-2 py-1 rounded-lg ${
                            score >= 80
                              ? "text-[#00D084] bg-[#00D084]/10"
                              : score >= 60
                              ? "text-yellow-400 bg-yellow-400/10"
                              : "text-red-400 bg-red-400/10"
                          }`}
                        >
                          {score}%
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRecording(sub);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isRec ? "bg-red-500 text-white animate-pulse" : "bg-[#00D084]/20 hover:bg-[#00D084]/30 text-[#00D084]"
                        }`}
                        title="Thu âm giọng nói của bạn"
                      >
                        {isRec ? "■" : "🎤"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "dictation" && (
            <div className="space-y-2.5 pb-20 mt-1">
              <div className="bg-[#252534] border border-[#3A3A4A] rounded-xl p-3 text-xs md:text-sm text-gray-300">
                🎧 <b>Chế độ Nghe chép chính tả từng câu:</b> Nhấn vào một dòng phụ đề — video sẽ <b>chỉ phát đúng câu đó rồi tự dừng</b> để bạn gõ lại.
              </div>
              {video.subtitles.map((sub, index) => {
                const isActive = index === activeSubtitleIndex;
                const diff = dictationResultMap[sub.id];
                const showHint = dictationShowHint[sub.id];

                return (
                  <div
                    key={sub.id}
                    ref={isActive ? activeItemRef : null}
                    onClick={() => {
                      if (!isActive) {
                        setDictationInput("");
                        playSubtitleSegment(sub, index);
                      }
                    }}
                    className={`p-3 md:p-4 rounded-xl transition-colors border flex gap-3 md:gap-4 ${
                      isActive
                        ? "bg-[#252530] border-[#00D084] shadow-lg"
                        : "bg-[#1E1E24] border-transparent cursor-pointer hover:bg-[#2A2A35]"
                    }`}
                  >
                    <div className="text-xs font-mono text-gray-400 pt-1 shrink-0 w-14">
                      <div>{formatTime(sub.startTime)}</div>
                      <div className="text-[10px] text-gray-500">→ {formatTime(sub.endTime)}</div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                      {isActive ? (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Nghe câu ({sub.text.split(/\s+/).length} từ) và gõ lại bên dưới:</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDictationShowHint((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }));
                              }}
                              className="text-amber-400 hover:underline font-medium"
                            >
                              {showHint ? "Ẩn gợi ý" : "💡 Gợi ý chữ cái đầu"}
                            </button>
                          </div>

                          {showHint && (
                            <div className="text-xs font-mono text-amber-300 bg-amber-500/10 p-2 rounded-lg">
                              Gợi ý:{" "}
                              {sub.text
                                .split(/\s+/)
                                .map((w) => w[0] + "_".repeat(Math.max(1, w.length - 1)))
                                .join(" ")}
                            </div>
                          )}

                          <textarea
                            value={dictationInput}
                            onChange={(e) => {
                              setDictationInput(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                checkDictationAdv(sub.id, sub.text);
                              }
                            }}
                            className="w-full bg-[#1A1A22] border border-[#3A3A4A] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D084] resize-none text-sm md:text-base"
                            placeholder="Gõ lại câu bạn vừa nghe (Nhấn Enter để kiểm tra)..."
                            rows={2}
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSubtitleSegment(sub, index);
                              }}
                              className="flex-1 py-2 px-3 bg-[#2A2A35] rounded-lg text-xs md:text-sm font-semibold hover:bg-[#3A3A4A]"
                            >
                              🔁 Nghe lại câu này
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                speakEnglish(sub.text, 0.8);
                              }}
                              className="py-2 px-3 bg-[#2A2A35] rounded-lg text-xs md:text-sm font-semibold hover:bg-[#3A3A4A]"
                              title="Nghe giọng đọc chuẩn chậm"
                            >
                              🐢 Nghe chậm
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                checkDictationAdv(sub.id, sub.text);
                              }}
                              className="flex-1 py-2 px-3 bg-[#00D084] text-black rounded-lg text-xs md:text-sm font-bold hover:opacity-90"
                            >
                              ✓ Kiểm tra đáp án
                            </button>
                          </div>

                          {diff && (
                            <div className="mt-1 p-3 bg-[#1A1A22] rounded-lg text-sm md:text-[15px] font-medium leading-relaxed border border-[#2A2A35]">
                              <div className="text-xs text-gray-400 mb-1">Kết quả đối chiếu (Xanh = Đúng, Đỏ = Cần sửa):</div>
                              <div>
                                {diff.map((w, i) => (
                                  <span
                                    key={i}
                                    className={w.status === "good" ? "text-[#00D084] font-bold" : "text-red-400 underline"}
                                  >
                                    {w.text}{" "}
                                  </span>
                                ))}
                              </div>
                              {sub.translation && (
                                <div className="text-xs text-[#8090C0] mt-2 pt-2 border-t border-[#2A2A35]">
                                  Nghĩa: {sub.translation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm md:text-[17px] font-medium text-gray-500 select-none flex items-center gap-2">
                            <span className="blur-[4px]">{sub.text.replace(/[a-zA-Z]/g, "x")}</span>
                            <span className="text-xs text-[#00D084] bg-[#00D084]/10 px-2 py-0.5 rounded-full">
                              ▶ Nhấn để nghe câu này
                            </span>
                          </div>
                          <div className="text-xs md:text-[14px] mt-1 text-[#6070A0]">
                            {sub.translation || "Bản dịch tiếng Việt..."}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}
