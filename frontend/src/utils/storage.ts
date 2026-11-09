export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://learning-english-app-lqg7.onrender.com");

export const getUserKey = (key: string): string => {
  if (typeof window === "undefined") return key;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        return `${key}_${user.id}`;
      }
    }
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }
  return key;
};

// Speak English text clearly using Web Speech API
export const speakEnglish = (text: string, rate = 0.92) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis failed:", e);
  }
};

// Spaced Repetition (SRS) local storage management (Leitner 5-box system)
export type SrsItem = {
  id: number;
  word: string;
  phonetic?: string;
  translation: string;
  definition: string;
  setId?: number;
  level: number; // 1 to 5 (5 = Mastered)
  nextReview: number; // timestamp ms
  lastReviewed: number;
};

const SRS_INTERVALS_MS = [
  0,
  4 * 60 * 60 * 1000, // Level 1 -> 4 hours
  24 * 60 * 60 * 1000, // Level 2 -> 1 day
  3 * 24 * 60 * 60 * 1000, // Level 3 -> 3 days
  7 * 24 * 60 * 60 * 1000, // Level 4 -> 7 days
  30 * 24 * 60 * 60 * 1000, // Level 5 -> 30 days
];

export const getSrsMap = (): Record<string, SrsItem> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getUserKey("srs_words_v2"));
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
};

export const saveSrsWord = (
  item: {
    id: number;
    word: string;
    phonetic?: string;
    translation?: string | null;
    definition?: string;
    setId?: number;
  },
  quality: "again" | "hard" | "good" | "easy"
): SrsItem => {
  const map = getSrsMap();
  const key = item.word.toLowerCase().trim();
  const existing = map[key];
  let level = existing?.level || 1;

  if (quality === "again") level = 1;
  else if (quality === "hard") level = Math.max(1, level);
  else if (quality === "good") level = Math.min(5, level + 1);
  else if (quality === "easy") level = Math.min(5, level + 2);

  const now = Date.now();
  const nextReview =
    quality === "again"
      ? now + 10 * 60 * 1000 // 10 mins
      : now + (SRS_INTERVALS_MS[level] || SRS_INTERVALS_MS[1]);

  const updated: SrsItem = {
    id: item.id || Date.now(),
    word: item.word,
    phonetic: item.phonetic || `/${item.word}/`,
    translation: item.translation || existing?.translation || "Từ vựng trọng tâm",
    definition:
      item.definition && !item.definition.startsWith("Definition of ")
        ? item.definition
        : existing?.definition || `We use "${item.word}" in daily English communication.`,
    setId: item.setId || existing?.setId,
    level,
    nextReview,
    lastReviewed: now,
  };

  map[key] = updated;
  if (typeof window !== "undefined") {
    localStorage.setItem(getUserKey("srs_words_v2"), JSON.stringify(map));
    recordStudyToday();
  }
  return updated;
};

export const recordStudyToday = () => {
  if (typeof window === "undefined") return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const days: string[] = JSON.parse(localStorage.getItem(getUserKey("study_days")) || "[]");
    if (!days.includes(today)) {
      days.push(today);
      localStorage.setItem(getUserKey("study_days"), JSON.stringify(days));
    }
  } catch (e) {}
};

// Free Dictionary API lookup for real IPA phonetics, audio, and example sentences
export const lookupWordDictionary = async (
  word: string
): Promise<{
  phonetic: string;
  audioUrl?: string;
  partOfSpeech?: string;
  definitionEn?: string;
  example?: string;
}> => {
  const clean = word.trim().toLowerCase();
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    const entry = data?.[0];
    const phonetic =
      entry?.phonetic ||
      entry?.phonetics?.find((p: any) => p.text)?.text ||
      `/${clean}/`;
    const audioUrl = entry?.phonetics?.find((p: any) => p.audio && p.audio.length > 0)?.audio;
    let partOfSpeech = "";
    let definitionEn = "";
    let example = "";

    for (const m of entry?.meanings || []) {
      if (!partOfSpeech && m.partOfSpeech) partOfSpeech = m.partOfSpeech;
      for (const d of m.definitions || []) {
        if (!definitionEn && d.definition) definitionEn = d.definition;
        if (!example && d.example) example = d.example;
      }
    }

    return {
      phonetic,
      audioUrl,
      partOfSpeech,
      definitionEn: definitionEn || `Common English word used in daily communication.`,
      example: example || `Let's use the word "${clean}" in a conversation today.`,
    };
  } catch {
    return {
      phonetic: `/${clean}/`,
      definitionEn: `Core English vocabulary word for communication.`,
      example: `Could you give me an example with "${clean}"?`,
    };
  }
};
