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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      theme = "daily life",
      scenario = "hobbies",
      apiKey,
    } = body;

    const cleanMsg = String(message || "").trim();
    if (!cleanMsg) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const activeKey = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    // If no Gemini API key is configured, return smart structured fallback
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

    const systemPrompt = `You are a world-class English Speaking Coach & AI Teacher (adapted from Gemini Teacher).
The student is a Vietnamese learner practicing spoken English in the theme "${theme}" and scenario "${scenario}".

Analyze the student's latest English utterance and respond strictly in valid JSON (no markdown fences) with these exact keys:
{
  "userRecognized": "the student's sentence",
  "score": <integer 0-100 evaluating grammar, naturalness, and clarity>,
  "grammarFeedback": "Short, encouraging feedback in Vietnamese explaining any grammar/wording mistake and how to fix it (or praising them if correct).",
  "betterExpression": "A more natural, native-like way to say what the student meant in English.",
  "replyEn": "Your natural conversational response + follow-up question in English to keep the roleplay going (1-2 sentences).",
  "replyVi": "Accurate Vietnamese translation of replyEn.",
  "nextPracticeSentence": "One short, useful English phrase/sentence related to this scenario for the student to try next."
}`;

    const contents = [
      ...history.slice(-6).map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: cleanMsg }],
      },
    ];

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let aiJson: any = null;
    let lastError = "";

    for (const modelName of modelsToTry) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
            activeKey
          )}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!resp.ok) {
          lastError = await resp.text();
          continue;
        }

        const data = await resp.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json|```/g, "").trim();
          aiJson = JSON.parse(cleaned);
          break;
        }
      } catch (e: any) {
        lastError = e.message || "Gemini call error";
      }
    }

    if (!aiJson) {
      return NextResponse.json(
        { error: `Không thể gọi Gemini API (${lastError.slice(0, 120)}). Vui lòng kiểm tra lại API Key.` },
        { status: 502 }
      );
    }

    return NextResponse.json({ mode: "gemini", ...aiJson });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
