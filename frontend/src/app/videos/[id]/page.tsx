"use client";
import { getUserKey } from "../../../utils/storage";

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

  // User state
  const [user, setUser] = useState<any>(null);
  const [startSeconds, setStartSeconds] = useState(0);

  // Auto-scroll logic
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Dictation State
  const [dictationInput, setDictationInput] = useState("");
  const [dictationResultMap, setDictationResultMap] = useState<Record<number, any[]>>({});

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (id) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}`}/videos/${id}`).then((res) => {
        const data = res.data;
        data.subtitles = data.subtitles.sort((a: Subtitle, b: Subtitle) => a.startTime - b.startTime);
        setVideo(data);
      }).catch((e) => {
        console.error(e);
        router.push("/videos");
      });
    }
  }, [id, router]);

  // Load progress
  useEffect(() => {
    if (video && user) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}`}/users/${user.id}/progress/video/${video.id}`)
        .then(res => {
           if (res.data && res.data.progressPercent) {
              setStartSeconds(res.data.progressPercent);
           }
        }).catch(console.error);
    }
  }, [video, user]);

  // Progress tracking loop
  useEffect(() => {
    let animationFrameId: number;
    const trackTime = () => {
      if (player && typeof player.getCurrentTime === 'function') {
        try {
           setCurrentTime(player.getCurrentTime());
        } catch (e) {}
      }
      animationFrameId = requestAnimationFrame(trackTime);
    };

    if (player) {
      animationFrameId = requestAnimationFrame(trackTime);

      progressSaveTimer.current = setInterval(() => {
        if (user && video && typeof player.getCurrentTime === 'function') {
          try {
            axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}`}/users/${user.id}/progress/video/${video.id}`, {
              progressPercent: player.getCurrentTime(),
              progressTime: player.getCurrentTime()
            }).catch(() => {});
          } catch (e) {}
        }
      }, 10000); // save progress every 10 seconds
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
    const index = video.subtitles.findIndex(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    if (index !== activeSubtitleIndex) {
      setActiveSubtitleIndex(index);
    }
  }, [currentTime, video, activeSubtitleIndex]);

  useEffect(() => {
    if (video && video.subtitles.length > 0) {
      const untranslated = video.subtitles.filter(s => !s.translation);
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
                 const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}/videos/translate`, { text: texts.join('\n') });
                 const translatedTexts = (res.data.text || "").split('\n');
                 let j = 0;
                 newVideo.subtitles = newVideo.subtitles.map(s => {
                    if (!s.translation && chunk.find((c: any) => c.id === s.id)) {
                       s.translation = translatedTexts[j] || "Lỗi dịch thuật";
                       j++;
                    }
                    return s;
                 });
                 setVideo({ ...newVideo }); // Update UI progressively
               } catch (e) {
                 console.error("Batch translate failed", e);
               }
            }
            // Save to backend silently after all chunks
            axios.put(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}`}/videos/${video.id}/subtitles`, { subtitles: newVideo.subtitles }).catch(()=>{});
         };
         translateChunks();
      }
    }
  }, [video?.id]); // Only run once when video is loaded

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
        behavior: "smooth"
      });
      setTimeout(() => { isAutoScrolling.current = false; }, 600);
    }
  }, [activeSubtitleIndex, autoScroll]);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    setPlayer(event.target);
  };

  const seekTo = (time: number) => {
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
    setTranslating(prev => ({ ...prev, [sub.id]: true }));
    try {
       const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}/videos/translate`, { text: sub.text });
       if (video) {
         const newVideo = { ...video };
         newVideo.subtitles[index].translation = res.data.text;
         setVideo(newVideo);
       }
    } catch (e) {
       console.error(e);
    }
    setTranslating(prev => ({ ...prev, [sub.id]: false }));
  };

  const handleSavePhrase = async (sub: Subtitle) => {
    if (!user) return alert("Please login");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "https://learning-english-app-lqg7.onrender.com"}/phrases`, {
        userId: user.id,
        videoId: video!.id,
        text: sub.text,
        translation: sub.translation,
        startTime: sub.startTime,
        endTime: sub.endTime
      });
      setSavedPhrases(prev => ({ ...prev, [sub.id]: true }));
    } catch (e) {
      console.error(e);
      alert("Failed to save phrase");
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
      setIsRecording(sub.id);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome/Edge.");
        setIsRecording(null);
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
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
        const origWords = sub.text.replace(/[^\w\s']/g, "").toLowerCase().split(/\s+/).filter(Boolean);
        const spokenWords = currentText.replace(/[^\w\s']/g, "").toLowerCase().split(/\s+/).filter(Boolean);
        
        let correctCount = 0;
        const diff = origWords.map(w => {
           if (spokenWords.includes(w)) {
              correctCount++;
              return { text: w, status: 'good' };
           }
           return { text: w, status: 'bad' };
        });
        
        setPronunciationTranscripts(prev => ({ ...prev, [sub.id]: diff }));
        setScores(prev => ({ ...prev, [sub.id]: Math.round((correctCount / origWords.length) * 100) || 0 }));
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
    const origWords = subText.replace(/[^\w\s']/g, "").toLowerCase().split(/\s+/).filter(Boolean);
    const spokenWords = dictationInput.replace(/[^\w\s']/g, "").toLowerCase().split(/\s+/).filter(Boolean);
    
    let correctCount = 0;
    const diff = origWords.map(w => {
       if (spokenWords.includes(w)) {
          correctCount++;
          return { text: w, status: 'good' };
       }
       return { text: w, status: 'bad' };
    });
    setDictationResultMap(prev => ({ ...prev, [subId]: diff }));
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

  if (!video) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col bg-[#1E1E24] text-white overflow-hidden">
      {/* HEADER & VIDEO (Top Section) */}
      <div className="w-full relative flex flex-col items-center bg-black">
        <div className="w-full flex items-center justify-between p-4 text-gray-300 absolute top-0 left-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button onClick={() => router.push("/videos")} className="hover:text-white flex items-center gap-2 drop-shadow">
              ← Thư viện
            </button>
            <span className="font-semibold text-white truncate max-w-lg drop-shadow">| {video.title}</span>
          </div>
          <button onClick={toggleSaveVideo} className={`text-white text-xs px-3 py-1.5 rounded-full font-medium transition-colors border pointer-events-auto drop-shadow ${isSaved ? "bg-red-500/80 hover:bg-red-600 border-red-400/50" : "bg-[#00D084]/80 hover:bg-[#00D084] border-[#00D084]/50"}`}>
            {isSaved ? "✕ Bỏ lưu" : "⭐ Lưu Video"}
          </button>
        </div>
        
        <div className="w-full max-w-5xl aspect-video relative group overflow-hidden bg-black">
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
                 cc_load_policy: 1
              },
            }}
            className="absolute inset-0 w-full h-full"
            onReady={onPlayerReady}
          />
        </div>
      </div>

      {/* BOTTOM SECTION (Tabs & Content) */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#1A1A20] border-t border-[#2A2A35]">
        {/* TABS */}
        <div className="flex px-4 border-b border-[#2A2A35] items-center">
          <button 
            className={`py-4 px-6 font-semibold text-sm transition-colors relative ${activeTab === 'subtitles' ? 'text-[#00D084]' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('subtitles')}
          >
            📄 Subtitles
            {activeTab === 'subtitles' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D084]"></div>}
          </button>
          <button 
            className={`py-4 px-6 font-semibold text-sm transition-colors relative ${activeTab === 'pronunciation' ? 'text-[#00D084]' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('pronunciation')}
          >
            🎤 Phát âm
            {activeTab === 'pronunciation' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D084]"></div>}
          </button>
          <button 
            className={`py-4 px-6 font-semibold text-sm transition-colors relative ${activeTab === 'dictation' ? 'text-[#00D084]' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('dictation')}
          >
            🎧 Chép chính tả
            {activeTab === 'dictation' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D084]"></div>}
          </button>
          
          <div className="ml-auto flex items-center gap-2">
            {!autoScroll ? (
              <span className="text-xs text-yellow-500 mr-2 opacity-70">Scrolling manually...</span>
            ) : (
               <span className="text-xs text-[#00D084] mr-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse"></span> Auto-scroll ON</span>
            )}
            <button onClick={() => setAutoScroll(!autoScroll)} className={`py-1 px-3 rounded-full text-xs font-bold border transition-colors ${autoScroll ? 'border-[#00D084]/30 text-[#00D084] bg-[#00D084]/10' : 'border-gray-600 text-gray-400'}`}>
              {autoScroll ? "Tắt tự cuộn" : "Bật tự cuộn"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div 
          ref={listRef} 
          className="flex-1 min-h-0 overflow-y-auto p-4 lg:px-8 max-w-5xl mx-auto w-full relative scroll-smooth"
          onScroll={handleManualScroll}
          onWheel={handleUserInteraction}
          onTouchMove={handleUserInteraction}
        >
          {activeTab === 'subtitles' && (
            <>
              <div className="flex justify-between items-center text-sm text-gray-400 mb-4 px-2">
                <span>{video.subtitles.length} đoạn · nhấn để lưu câu hay</span>
                <div className="bg-[#2A2A35] px-3 py-1 rounded-full flex gap-2">🇻🇳 + 🇬🇧</div>
              </div>
              <div className="space-y-3 pb-20">
                {video.subtitles.map((sub, index) => {
                  const isActive = index === activeSubtitleIndex;
                  return (
                    <div
                      key={sub.id}
                      ref={isActive ? activeItemRef : null}
                      onClick={() => seekTo(sub.startTime)}
                      className={`p-4 rounded-xl cursor-pointer transition-colors border flex gap-4 ${
                        isActive ? "bg-[#252530] border-[#3A3A4A]" : "bg-[#1E1E24] border-transparent hover:bg-[#2A2A35]"
                      }`}
                    >
                      <div className="text-xs font-mono text-gray-500 pt-1 shrink-0 w-12">
                        {formatTime(sub.startTime)}
                      </div>
                      <div className="flex-1">
                        <div className={`text-[17px] font-medium leading-relaxed ${isActive ? "text-white" : "text-gray-200"}`}>{sub.text}</div>
                        <div className={`text-[15px] mt-1 ${isActive ? "text-[#8090C0]" : "text-[#6070A0]"}`}>
                          {sub.translation || (
                             <button onClick={(e) => { e.stopPropagation(); handleTranslate(sub, index); }} className="text-sm underline text-blue-400 hover:text-blue-300">
                               {translating[sub.id] ? "Đang dịch..." : "Dịch sang Tiếng Việt"}
                             </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const utterance = new SpeechSynthesisUtterance(sub.text);
                            utterance.lang = 'en-US';
                            utterance.volume = 1;
                            utterance.rate = 0.9;
                            window.speechSynthesis.speak(utterance);
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-[#2A2A35] text-gray-400 hover:text-white hover:bg-blue-500/20"
                          title="Listen to pronunciation"
                        >
                          🔊
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSavePhrase(sub); }}
                          disabled={savedPhrases[sub.id]}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${savedPhrases[sub.id] ? 'bg-green-500/20 text-green-400' : 'bg-[#2A2A35] text-gray-400 hover:text-white hover:bg-green-500/20'}`}
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

          {activeTab === 'pronunciation' && (
             <div className="space-y-3 pb-20 mt-4">
              {video.subtitles.map((sub, index) => {
                const isActive = index === activeSubtitleIndex;
                const isRec = isRecording === sub.id;
                const score = scores[sub.id];
                const diff = pronunciationTranscripts[sub.id];

                return (
                  <div
                    key={sub.id}
                    ref={isActive ? activeItemRef : null}
                    onClick={() => seekTo(sub.startTime)}
                    className={`p-4 rounded-xl cursor-pointer transition-colors border flex gap-4 ${
                      isActive ? "bg-[#252530] border-[#3A3A4A]" : "bg-[#1E1E24] border-transparent hover:bg-[#2A2A35]"
                    }`}
                  >
                    <div className="text-xs font-mono text-gray-500 pt-1 shrink-0 w-12">
                      {formatTime(sub.startTime)}
                    </div>
                    <div className="flex-1">
                      <div className={`text-[17px] font-medium leading-relaxed ${isActive ? "text-white" : "text-gray-200"}`}>
                        {diff ? diff.map((w, i) => (
                          <span key={i} className={w.status === 'good' ? 'text-[#00D084]' : 'text-red-400'}>{w.text} </span>
                        )) : sub.text}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center shrink-0 w-12">
                      {score !== undefined && !isRec ? (
                        <div className={`text-lg font-bold ${score >= 80 ? 'text-[#00D084]' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {score}%
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleRecording(sub); }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isRec ? "bg-red-500 text-white animate-pulse" : "bg-[#2A2A35] hover:bg-[#3A3A4A] text-white"
                          }`}
                        >
                          {isRec ? "■" : "🎤"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
             </div>
          )}

          {activeTab === 'dictation' && (
             <div className="space-y-3 pb-20 mt-4">
              {video.subtitles.map((sub, index) => {
                const isActive = index === activeSubtitleIndex;
                const diff = dictationResultMap[sub.id];
                
                return (
                  <div
                    key={sub.id}
                    ref={isActive ? activeItemRef : null}
                    onClick={() => {
                       if (!isActive) seekTo(sub.startTime);
                    }}
                    className={`p-4 rounded-xl transition-colors border flex gap-4 ${
                      isActive ? "bg-[#252530] border-[#00D084]" : "bg-[#1E1E24] border-transparent cursor-pointer hover:bg-[#2A2A35]"
                    }`}
                  >
                    <div className="text-xs font-mono text-gray-500 pt-1 shrink-0 w-12">
                      {formatTime(sub.startTime)}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      {isActive ? (
                        <div className="flex flex-col gap-3">
                           <textarea 
                              value={dictationInput}
                              onChange={(e) => { setDictationInput(e.target.value); }}
                              className="w-full bg-[#1A1A22] border border-[#3A3A4A] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D084] resize-none"
                              placeholder="Gõ đoạn bạn vừa nghe..."
                              rows={2}
                           />
                           <div className="flex gap-2">
                             <button onClick={() => seekTo(sub.startTime)} className="flex-1 py-2 bg-[#2A2A35] rounded-lg text-sm font-semibold hover:bg-[#3A3A4A]">🔁 Nghe lại</button>
                             <button onClick={() => checkDictationAdv(sub.id, sub.text)} className="flex-1 py-2 bg-[#00D084] text-black rounded-lg text-sm font-bold hover:opacity-90">Kiểm tra</button>
                           </div>
                           
                           {diff && (
                             <div className="mt-2 p-3 bg-[#1A1A22] rounded-lg text-[15px] font-medium leading-relaxed">
                                {diff.map((w, i) => (
                                  <span key={i} className={w.status === 'good' ? 'text-[#00D084]' : 'text-red-400'}>{w.text} </span>
                                ))}
                             </div>
                           )}
                        </div>
                      ) : (
                        <div>
                          <div className="text-[17px] font-medium text-gray-600 select-none blur-[4px]">
                            {sub.text.replace(/[a-zA-Z]/g, 'x')}
                          </div>
                          <div className="text-[15px] mt-1 text-[#6070A0]">{sub.translation || "Bản dịch..."}</div>
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
