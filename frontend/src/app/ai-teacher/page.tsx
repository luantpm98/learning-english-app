"use client";
import { speakEnglish } from "../../utils/storage";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const THEMES: Record<string, { label: string; icon: string; scenarios: { id: string; label: string; starterEn: string; starterVi: string }[] }> = {
  business: {
    label: "Công sở & Kinh doanh",
    icon: "💼",
    scenarios: [
      { id: "job interview", label: "Phỏng vấn xin việc", starterEn: "Hello! Thank you for coming today. Could you introduce yourself briefly?", starterVi: "Xin chào! Cảm ơn bạn đã đến hôm nay. Bạn có thể giới thiệu ngắn gọn về bản thân không?" },
      { id: "business meeting", label: "Họp nhóm công việc", starterEn: "Good morning! Let's review our project progress. How are your tasks going?", starterVi: "Chào buổi sáng! Hãy cùng xem tiến độ dự án nhé. Công việc của bạn thế nào rồi?" },
      { id: "presentation", label: "Thuyết trình ý tưởng", starterEn: "Welcome! We're excited to hear your new proposal. What is the main goal?", starterVi: "Chào mừng bạn! Chúng tôi rất mong được nghe đề xuất mới của bạn. Mục tiêu chính là gì?" },
      { id: "networking", label: "Kết nối đối tác", starterEn: "Hi there! Nice to meet you at this conference. Which company are you with?", starterVi: "Xin chào! Rất vui được gặp bạn tại hội nghị. Bạn đang làm việc ở công ty nào vậy?" },
    ],
  },
  travel: {
    label: "Du lịch & Di chuyển",
    icon: "✈️",
    scenarios: [
      { id: "airport", label: "Sân bay & Hải quan", starterEn: "Good morning! May I see your passport and boarding pass, please?", starterVi: "Chào buổi sáng! Cho tôi xem hộ chiếu và thẻ lên máy bay của bạn nhé?" },
      { id: "hotel", label: "Nhận phòng khách sạn", starterEn: "Welcome to our hotel! Do you have a reservation under your name?", starterVi: "Chào mừng đến khách sạn! Bạn có đặt phòng trước dưới tên mình không?" },
      { id: "restaurant", label: "Gọi món nhà hàng", starterEn: "Good evening! Are you ready to order, or would you like a few more minutes?", starterVi: "Chào buổi tối! Bạn đã sẵn sàng gọi món chưa hay cần thêm vài phút?" },
      { id: "sightseeing", label: "Hỏi đường & Tham quan", starterEn: "Hi! You look like you're exploring the city. Can I help you find anything?", starterVi: "Chào bạn! Có vẻ bạn đang tham quan thành phố. Tôi có thể giúp bạn tìm đường không?" },
    ],
  },
  "daily life": {
    label: "Đời sống hàng ngày",
    icon: "🏡",
    scenarios: [
      { id: "shopping", label: "Mua sắm & Trả giá", starterEn: "Hi! Welcome to our store. Are you looking for anything specific today?", starterVi: "Chào bạn! Chào mừng đến cửa hàng. Hôm nay bạn đang tìm món đồ nào cụ thể không?" },
      { id: "weather", label: "Trò chuyện thời tiết", starterEn: "What a lovely day! Do you prefer sunny weather or cooler rainy days?", starterVi: "Ngày hôm nay đẹp trời quá! Bạn thích trời nắng hay những ngày mưa mát mẻ hơn?" },
      { id: "hobbies", label: "Sở thích cá nhân", starterEn: "Hey! What do you usually like to do to relax after a busy day?", starterVi: "Này! Sau một ngày bận rộn bạn thường thích làm gì để thư giãn?" },
      { id: "family", label: "Gia đình & Cuộc sống", starterEn: "Tell me a bit about your family! Do you live nearby or in another city?", starterVi: "Kể cho mình nghe một chút về gia đình bạn đi! Bạn sống gần đây hay ở thành phố khác?" },
    ],
  },
  social: {
    label: "Giao tiếp & Kết bạn",
    icon: "🎉",
    scenarios: [
      { id: "meeting friends", label: "Gặp gỡ bạn bè", starterEn: "Long time no see! How have you been lately?", starterVi: "Lâu rồi không gặp! Dạo này bạn khỏe và công việc thế nào rồi?" },
      { id: "party", label: "Tiệc tùng & Giao lưu", starterEn: "Great party, isn't it? How do you know the host?", starterVi: "Bữa tiệc vui quá phải không? Bạn quen biết chủ tiệc như thế nào vậy?" },
      { id: "social media", label: "Mạng xã hội & Xu hướng", starterEn: "Have you seen any interesting videos or trends online this week?", starterVi: "Tuần này bạn có thấy video hay xu hướng nào thú vị trên mạng không?" },
      { id: "dating", label: "Hẹn hò & Làm quen", starterEn: "I'm so glad we finally met! What kind of food or coffee do you usually enjoy?", starterVi: "Mình rất vui vì cuối cùng tụi mình cũng gặp nhau! Bạn thường thích đồ ăn hay cà phê kiểu gì?" },
    ],
  },
};

type ChatTurn = {
  id: string;
  role: "assistant" | "user";
  text: string;
  vi?: string;
  score?: number;
  grammarFeedback?: string;
  betterExpression?: string;
  nextPracticeSentence?: string;
};

export default function GeminiTeacherPage() {
  const [themeKey, setThemeKey] = useState<string>("daily life");
  const [scenarioIdx, setScenarioIdx] = useState<number>(2); // hobbies
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [paused, setPaused] = useState(false);

  // API key settings
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES[themeKey];
  const currentScenario = currentTheme.scenarios[scenarioIdx] || currentTheme.scenarios[0];

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key") || "";
    setApiKey(savedKey);
    setTempKey(savedKey);
  }, []);

  // Reset conversation when theme/scenario changes
  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        text: currentScenario.starterEn,
        vi: currentScenario.starterVi,
      },
    ]);
    setPaused(false);
  }, [themeKey, scenarioIdx]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendToTeacher = async (userText: string) => {
    const clean = userText.trim();
    if (!clean) return;

    // Gemini Teacher voice control commands
    if (clean.toLowerCase().includes("can i have a break")) {
      setPaused(true);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + "-u", role: "user", text: clean },
        {
          id: Date.now() + "-a",
          role: "assistant",
          text: "Of course! Take a break whenever you need. Say 'OK let's continue' when you're ready.",
          vi: "Tất nhiên rồi! Bạn cứ nghỉ ngơi một chút. Khi nào sẵn sàng hãy nói 'OK let's continue' nhé.",
        },
      ]);
      speakEnglish("Of course! Take a break whenever you need.");
      return;
    }

    if (paused && clean.toLowerCase().includes("continue")) {
      setPaused(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + "-u", role: "user", text: clean },
        {
          id: Date.now() + "-a",
          role: "assistant",
          text: "Awesome! Let's continue our English practice.",
          vi: "Tuyệt vời! Chúng ta tiếp tục luyện nói tiếng Anh nhé.",
        },
      ]);
      speakEnglish("Awesome! Let's continue our English practice.");
      return;
    }

    const userTurn: ChatTurn = { id: Date.now() + "-u", role: "user", text: clean };
    setMessages((prev) => [...prev, userTurn]);
    setInputText("");
    setLoading(true);

    try {
      const res = await axios.post("/api/gemini-teacher", {
        message: clean,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        theme: themeKey,
        scenario: currentScenario.id,
        apiKey: apiKey || undefined,
      });

      const d = res.data;
      const aiTurn: ChatTurn = {
        id: Date.now() + "-a",
        role: "assistant",
        text: d.replyEn,
        vi: d.replyVi,
        score: d.score,
        grammarFeedback: d.grammarFeedback,
        betterExpression: d.betterExpression,
        nextPracticeSentence: d.nextPracticeSentence,
      };
      setMessages((prev) => [...prev, aiTurn]);
      speakEnglish(d.replyEn);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Có lỗi khi kết nối Gia sư AI.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "-err",
          role: "assistant",
          text: "Sorry, I had trouble connecting. Let's try again!",
          vi: msg,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome/Edge/Safari.");
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript;
      setIsListening(false);
      sendToTeacher(spoken);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const saveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = tempKey.trim();
    if (!cleaned) {
      setApiKey("");
      localStorage.removeItem("gemini_api_key");
      setKeyStatus(null);
      setShowKeyModal(false);
      return;
    }

    setTestingKey(true);
    setKeyStatus(null);
    try {
      const res = await axios.post("/api/gemini-teacher", {
        action: "test",
        apiKey: cleaned,
      });
      if (res.data?.ok) {
        setApiKey(cleaned);
        localStorage.setItem("gemini_api_key", cleaned);
        setKeyStatus({ type: "ok", text: res.data.message || "Kết nối Gemini thành công!" });
        setTimeout(() => setShowKeyModal(false), 900);
      } else {
        setKeyStatus({ type: "err", text: res.data?.error || "API Key không hợp lệ." });
      }
    } catch (err: any) {
      setKeyStatus({
        type: "err",
        text: err.response?.data?.error || "Không thể kết nối tới Gemini API. Vui lòng kiểm tra lại Key.",
      });
    } finally {
      setTestingKey(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full p-4 md:p-6 pb-20 md:pb-6 gap-4 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-3xl shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
            🤖
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-extrabold leading-tight">Gia Sư Gemini AI (1-kèm-1)</h1>
            <p className="text-xs text-muted-foreground">
              Luyện nói tiếng Anh trực tiếp · Sửa ngữ pháp · Chấm điểm phát âm & gợi ý câu bản xứ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowKeyModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              apiKey
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-500"
                : "bg-amber-500/15 border-amber-500/40 text-amber-500"
            }`}
          >
            {apiKey ? "🔑 Gemini AI: Đã kết nối" : "🔑 Nhập Gemini API Key"}
          </button>
        </div>
      </div>

      {/* THEME & SCENARIO SELECTOR */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => {
                setThemeKey(key);
                setScenarioIdx(0);
              }}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                themeKey === key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {currentTheme.scenarios.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => setScenarioIdx(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                scenarioIdx === idx
                  ? "bg-secondary text-primary border border-primary/40"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT & FEEDBACK STREAM */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-card/60 border border-border rounded-3xl p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            {m.role === "user" ? (
              <div className="max-w-[85%] md:max-w-[70%] bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
                <p className="font-semibold text-sm md:text-base">{m.text}</p>
              </div>
            ) : (
              <div className="max-w-[92%] md:max-w-[80%] space-y-2">
                {/* Score & Grammar Coach Card (when evaluating user's turn) */}
                {m.score !== undefined && (
                  <div className="bg-secondary/70 border border-border rounded-2xl p-3.5 text-xs md:text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-muted-foreground uppercase text-[11px]">
                        📊 Đánh giá từ Gia sư AI
                      </span>
                      <span
                        className={`font-extrabold px-2.5 py-0.5 rounded-full ${
                          m.score >= 80
                            ? "bg-emerald-500/20 text-emerald-500"
                            : m.score >= 60
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        Điểm: {m.score}/100
                      </span>
                    </div>
                    {m.grammarFeedback && <p className="text-foreground leading-relaxed">{m.grammarFeedback}</p>}
                    {m.betterExpression && (
                      <div className="bg-background/70 p-2.5 rounded-xl border border-border flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-primary block">✨ Cách nói tự nhiên hơn:</span>
                          <span className="font-bold text-foreground">{m.betterExpression}</span>
                        </div>
                        <button
                          onClick={() => speakEnglish(m.betterExpression!)}
                          className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0"
                        >
                          🔊
                        </button>
                      </div>
                    )}
                    {m.nextPracticeSentence && (
                      <p className="text-xs text-amber-500">
                        💡 <b>Gợi ý câu tiếp theo:</b> {m.nextPracticeSentence}
                      </p>
                    )}
                  </div>
                )}

                {/* AI Conversational Reply */}
                <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-sm md:text-base text-foreground leading-relaxed">{m.text}</p>
                    <button
                      onClick={() => speakEnglish(m.text)}
                      className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                      title="Nghe lại"
                    >
                      🔊
                    </button>
                  </div>
                  {m.vi && <p className="text-xs md:text-sm text-muted-foreground">{m.vi}</p>}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
            <span className="animate-spin">⏳</span> Gia sư Gemini đang lắng nghe và phân tích câu của bạn...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT & VOICE CONTROLS */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleMic}
          disabled={loading}
          className={`px-4 md:px-5 py-3.5 rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center gap-2 shrink-0 ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-emerald-500 text-black hover:opacity-90"
          }`}
        >
          <span>{isListening ? "⏹" : "🎤"}</span>
          <span className="hidden sm:inline">{isListening ? "Đang nghe..." : "Nói Tiếng Anh"}</span>
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendToTeacher(inputText);
          }}
          className="flex-1 flex gap-2"
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hoặc gõ câu trả lời tiếng Anh của bạn tại đây..."
            className="flex-1 px-4 py-3.5 rounded-2xl bg-card border border-border focus:outline-none focus:border-primary text-sm"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-5 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 shrink-0"
          >
            Gửi
          </button>
        </form>
      </div>

      {/* GEMINI API KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">🔑 Cấu hình Google Gemini API Key</h2>
              <button onClick={() => setShowKeyModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Lấy API Key miễn phí tại{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline font-bold"
              >
                aistudio.google.com/app/apikey
              </a>{" "}
              để kích hoạt chấm điểm phát âm, sửa ngữ pháp chi tiết và hội thoại AI không giới hạn theo từng chủ đề. Key chỉ lưu trên trình duyệt của bạn.
            </p>
            <form onSubmit={saveApiKey} className="space-y-3">
              <input
                type="password"
                value={tempKey}
                onChange={(e) => {
                  setTempKey(e.target.value);
                  setKeyStatus(null);
                }}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-sm font-mono"
              />
              {keyStatus && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold ${
                    keyStatus.type === "ok"
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-red-500/15 text-red-500"
                  }`}
                >
                  {keyStatus.type === "ok" ? "✅ " : "⚠️ "}
                  {keyStatus.text}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary font-bold text-sm"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={testingKey}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-60"
                >
                  {testingKey ? "⏳ Đang kiểm tra..." : "Kiểm tra & Lưu Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
