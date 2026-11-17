import { NextRequest, NextResponse } from "next/server";

const FALLBACK_REPLIES: Record<string, { en: string; vi: string; tip: string }[]> = {
  business: [
    {
      en: "That's a great point! Could you tell me more about your biggest achievement in that project?",
      vi: "Ý kiến rất hay! Bạn có thể chia sẻ thêm về thành tựu lớn nhất của bạn trong dự án đó không?",
      tip: "Dùng thì quá khứ đơn (worked, achieved, led) khi kể về kinh nghiệm đã qua.",
    },
    {
      en: "I see. How do you usually handle tight deadlines when working with a team?",
      vi: "Tôi hiểu rồi. Bạn thường xử lý thế nào khi có hạn chót gấp lúc làm việc nhóm?",
      tip: "Bạn có thể dùng cụm: 'I prioritize the most urgent tasks first.'",
    },
  ],
  travel: [
    {
      en: "Sounds exciting! Do you prefer booking hotels in advance or finding places on arrival?",
      vi: "Nghe thú vị đấy! Bạn thích đặt khách sạn trước hay đến nơi mới tìm chỗ ở?",
      tip: "Thử trả lời: 'I prefer booking in advance to save time and money.'",
    },
    {
      en: "Got it! May I ask how many bags you are checking in today?",
      vi: "Rõ rồi ạ! Cho tôi hỏi hôm nay bạn ký gửi bao nhiêu kiện hành lý?",
      tip: "Dùng: 'I'm checking in one suitcase and carrying one backpack.'",
    },
  ],
  "daily life": [
    {
      en: "Really? How often do you do that during the week?",
      vi: "Thật sao? Trong tuần bạn có thường xuyên làm việc đó không?",
      tip: "Dùng trạng từ tần suất: usually, twice a week, whenever I have free time.",
    },
    {
      en: "That sounds relaxing! What else do you enjoy doing on weekends?",
      vi: "Nghe thư giãn quá! Cuối tuần bạn còn thích làm gì khác nữa không?",
      tip: "Cấu trúc hay: 'Besides that, I also enjoy + V-ing...'",
    },
  ],
  social: [
    {
      en: "Nice! How did you two first meet each other?",
      vi: "Tuyệt quá! Hai bạn gặp nhau lần đầu như thế nào vậy?",
      tip: "Thử trả lời: 'We met at a coffee shop / through a mutual friend.'",
    },
    {
      en: "That's awesome! Are you planning to go to any events this weekend?",
      vi: "Tuyệt vời! Cuối tuần này bạn có dự định tham gia sự kiện nào không?",
      tip: "Dùng: 'I'm thinking about going to...'",
    },
  ],
};

const modelCache = new Map<string, { model: string; apiVer: string }>();

async function discoverTextModels(apiKey: string): Promise<string[]> {
  const preferred = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
  ];

  try {
    const listResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    if (!listResp.ok) return preferred;
    const listData = await listResp.json();
    const available: string[] = (listData.models || [])
      .filter((m: any) => {
        const name = String(m.name || "").toLowerCase();
        const methods: string[] = m.supportedGenerationMethods || [];
        return (
          methods.includes("generateContent") &&
          name.includes("gemini") &&
          !name.includes("latest") &&
          !name.includes("1.0") &&
          !name.includes("tts") &&
          !name.includes("image") &&
          !name.includes("embedding") &&
          !name.includes("audio") &&
          !name.includes("vision") &&
          !name.includes("robotics") &&
          !name.includes("computer")
        );
      })
      .map((m: any) => String(m.name).replace(/^models\//, ""));

    if (available.length === 0) return preferred;

    // Sort so preferred fast flash models come first
    available.sort((a, b) => {
      const idxA = preferred.findIndex((p) => a === p || a.startsWith(p));
      const idxB = preferred.findIndex((p) => b === p || b.startsWith(p));
      const rankA = idxA === -1 ? 999 : idxA;
      const rankB = idxB === -1 ? 999 : idxB;
      return rankA - rankB;
    });

    return available.slice(0, 6);
  } catch {
    return preferred;
  }
}

async function callGemini(apiKey: string, payload: any, preferredModel?: string) {
  const cached = modelCache.get(apiKey);
  const directModel = preferredModel || cached?.model;

  // Fast path: skip ListModels completely when we already know a working fast model
  if (directModel) {
    const apiVer = cached?.apiVer || "v1beta";
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/${apiVer}/models/${directModel}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          modelCache.set(apiKey, { model: directModel, apiVer });
          return { ok: true, model: directModel, text };
        }
      }
    } catch {}
  }

  const candidateModels = await discoverTextModels(apiKey);
  let lastError = "";

  for (const modelName of candidateModels) {
    for (const apiVer of ["v1beta", "v1"]) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/${apiVer}/models/${modelName}:generateContent?key=${encodeURIComponent(
            apiKey
          )}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (resp.ok) {
          const data = await resp.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            modelCache.set(apiKey, { model: modelName, apiVer });
            return { ok: true, model: modelName, text };
          }
        } else {
          const errBody = await resp.text();
          lastError = `${resp.status} (${modelName}): ${errBody}`;
          if (resp.status === 400 && errBody.includes("API_KEY_INVALID")) {
            return { ok: false, error: "API Key không hợp lệ. Vui lòng kiểm tra lại mã key từ Google AI Studio." };
          }
          if (resp.status === 403) {
            return { ok: false, error: "API Key bị từ chối quyền truy cập (403). Vui lòng kiểm tra key trên Google AI Studio." };
          }
        }
      } catch (e: any) {
        lastError = e.message || "Network error";
      }
    }
  }

  return { ok: false, error: lastError || "Không tìm thấy model Gemini khả dụng cho API Key này." };
}

function safeParseJson(rawText: string) {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Invalid JSON");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "chat",
      message,
      history = [],
      theme = "daily life",
      scenario = "hobbies",
      topic = "Daily Communication",
      apiKey,
      preferredModel,
    } = body;

    const activeKey = String(apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();

    // 1. TEST CONNECTION ACTION
    if (action === "test") {
      if (!activeKey) {
        return NextResponse.json({ ok: false, error: "Vui lòng nhập API Key" }, { status: 400 });
      }
      const res = await callGemini(activeKey, {
        contents: [{ role: "user", parts: [{ text: "Reply with just: OK" }] }],
      });
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true, model: res.model, message: `Kết nối thành công (${res.model})!` });
    }

    // 2. GENERATE NEW REFLEX ITEMS (Q&A or Golden Patterns)
    if (action === "generate_qa" || action === "generate_patterns") {
      if (!activeKey) {
        return NextResponse.json(
          { error: "Chưa có Gemini API Key. Đang dùng kho câu mở rộng có sẵn." },
          { status: 400 }
        );
      }

      const prompt =
        action === "generate_qa"
          ? `Generate 5 brand new, practical English spoken Q&A reflex exercises for Vietnamese learners on the topic "${topic}".
Return strictly a JSON array (no markdown) of 5 objects with these exact keys:
[
  {
    "topic": "${topic}",
    "questionEn": "Natural spoken English question",
    "questionVi": "Vietnamese translation of the question",
    "hintVi": "Short Vietnamese hint on how to answer",
    "sampleAnswerEn": "Natural native-like English answer (1-2 sentences)",
    "sampleAnswerVi": "Vietnamese translation of sample answer",
    "keywords": ["word1", "word2", "word3", "word4"]
  }
]`
          : `Generate 5 brand new, high-frequency English speaking sentence patterns (Khung câu vàng) for Vietnamese learners on the topic "${topic}".
Return strictly a JSON array (no markdown) of 5 objects with these exact keys:
[
  {
    "pattern": "Pattern structure e.g. I'm thinking about + [V-ing]...",
    "meaningVi": "Vietnamese meaning",
    "exampleEn": "Natural spoken English example",
    "exampleVi": "Vietnamese translation",
    "tip": "Practical Vietnamese usage tip"
  }
]`;

      const res = await callGemini(
        activeKey,
        {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9 },
        },
        preferredModel
      );

      if (!res.ok || !res.text) {
        return NextResponse.json({ error: res.error || "Không tạo được câu mới" }, { status: 502 });
      }

      const items = safeParseJson(res.text);
      return NextResponse.json({ ok: true, items: Array.isArray(items) ? items : [] });
    }

    // 3. CONVERSATIONAL AI TEACHER CHAT
    const cleanMsg = String(message || "").trim();
    if (!cleanMsg) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!activeKey) {
      const pool = FALLBACK_REPLIES[theme] || FALLBACK_REPLIES["daily life"];
      const picked = pool[history.length % pool.length];
      const words = cleanMsg.split(/\s+/).filter(Boolean);
      const estScore = Math.min(95, Math.max(68, 60 + words.length * 4));
      return NextResponse.json({
        mode: "fallback",
        userRecognized: cleanMsg,
        score: estScore,
        grammarFeedback:
          words.length < 4
            ? "Câu hơi ngắn. Hãy thử trả lời thành một câu hoàn chỉnh (Chủ ngữ + Động từ + Tân ngữ) để luyện phản xạ tốt hơn."
            : "Cấu trúc câu rõ ràng, truyền đạt được ý chính! (Nhập Gemini API Key miễn phí để AI chấm sâu từng lỗi ngữ pháp & từ vựng).",
        betterExpression: cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1),
        replyEn: picked.en,
        replyVi: picked.vi,
        nextPracticeSentence: picked.tip,
      });
    }

    const instruction = `You are an expert, attentive 1-on-1 English Speaking Tutor coaching a Vietnamese learner in theme "${theme}" and scenario "${scenario}".
You MUST evaluate the learner's latest English message thoroughly and reply STRICTLY as a valid JSON object with ALL 7 required keys below (do NOT omit any key):
{
  "userRecognized": "the exact sentence the learner said",
  "score": <integer 0-100 evaluating grammar, vocabulary, and naturalness>,
  "grammarFeedback": "Clear feedback in Vietnamese: point out specific grammar/word choice mistakes and explain how to fix them, or praise what they did well.",
  "betterExpression": "A recommended, more natural native-speaker way to express what the learner meant in English (always provide an improved or polished version!).",
  "replyEn": "Your warm, human-like conversational reply + 1 follow-up question in English to keep the dialogue flowing.",
  "replyVi": "Accurate Vietnamese translation of replyEn.",
  "nextPracticeSentence": "One recommended English sentence/pattern for the learner to try next in this scenario (with brief Vietnamese meaning in parentheses)."
}`;

    const contents = [
      {
        role: "user",
        parts: [{ text: instruction }],
      },
      {
        role: "model",
        parts: [
          {
            text: '{"userRecognized":"Ready","score":100,"grammarFeedback":"Sẵn sàng hỗ trợ bạn!","betterExpression":"I am ready to practice.","replyEn":"Great, let us begin!","replyVi":"Tuyệt vời, chúng ta bắt đầu nhé!","nextPracticeSentence":"Nice to meet you! (Rất vui được gặp bạn!)"}',
          },
        ],
      },
      ...history.slice(-8).map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: `Student said: "${cleanMsg}". Remember to return ONLY valid JSON with all 7 keys including betterExpression and nextPracticeSentence.` }],
      },
    ];

    const res = await callGemini(
      activeKey,
      {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 900,
          responseMimeType: "application/json",
        },
      },
      preferredModel
    );

    if (!res.ok || !res.text) {
      return NextResponse.json(
        { error: res.error || "Không thể kết nối Gemini API. Vui lòng kiểm tra lại API Key." },
        { status: 502 }
      );
    }

    try {
      const aiJson = safeParseJson(res.text);
      return NextResponse.json({ mode: "gemini", model: res.model, ...aiJson });
    } catch {
      return NextResponse.json({
        mode: "gemini",
        model: res.model,
        userRecognized: cleanMsg,
        score: 85,
        grammarFeedback: "Gia sư AI đã phản hồi:",
        betterExpression: cleanMsg,
        replyEn: res.text,
        replyVi: "",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
