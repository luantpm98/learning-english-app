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

async function callGemini(apiKey: string, payload: any) {
  // Prefer modern fast models, then discover available models if needed
  let candidateModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
  ];

  // Try calling candidate models
  let lastError = "";
  for (const modelName of candidateModels) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
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
        if (text) return { ok: true, model: modelName, text };
      } else {
        const errBody = await resp.text();
        lastError = `${resp.status}: ${errBody}`;
        // If API key itself is invalid (400 API_KEY_INVALID / 403), stop immediately
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

  // Fallback: dynamically list models enabled for this key and pick the first generateContent model
  try {
    const listResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    if (listResp.ok) {
      const listData = await listResp.json();
      const validModel = (listData.models || []).find(
        (m: any) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent") &&
          m.name?.includes("gemini")
      );
      if (validModel) {
        const cleanName = validModel.name.replace(/^models\//, "");
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${encodeURIComponent(
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
          if (text) return { ok: true, model: cleanName, text };
        }
      }
    }
  } catch {}

  return { ok: false, error: lastError || "Không thể kết nối Gemini API" };
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

      const res = await callGemini(activeKey, {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9 },
      });

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

    const instruction = `You are a friendly, expert English Speaking Coach for a Vietnamese learner practicing the theme "${theme}" and scenario "${scenario}".
Evaluate the learner's English sentence and reply STRICTLY as valid JSON (no markdown fences) with these exact keys:
{
  "userRecognized": "the learner's sentence",
  "score": <integer 0-100>,
  "grammarFeedback": "Short feedback in Vietnamese explaining grammar/wording mistakes or praising them",
  "betterExpression": "A more natural, native-like English version of what they said",
  "replyEn": "Your natural conversational reply + 1 follow-up question in English",
  "replyVi": "Vietnamese translation of replyEn",
  "nextPracticeSentence": "One short useful English phrase they can try next"
}`;

    const contents = [
      {
        role: "user",
        parts: [{ text: instruction }],
      },
      {
        role: "model",
        parts: [{ text: '{"replyEn":"Understood! Ready to coach."}' }],
      },
      ...history.slice(-6).map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: `Student said: "${cleanMsg}"` }],
      },
    ];

    const res = await callGemini(activeKey, {
      contents,
      generationConfig: { temperature: 0.7 },
    });

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
