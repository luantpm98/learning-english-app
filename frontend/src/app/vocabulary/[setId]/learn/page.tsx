"use client";
import { getUserKey, API_URL, speakEnglish, saveSrsWord, lookupWordDictionary } from "../../../../utils/storage";
import { BUILTIN_VOCAB_SETS } from "../../../../utils/curatedData";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

type LearnMode = "flashcard" | "quiz" | "listening" | "match";

export default function LearnSetPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;

  const [set, setSet] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [mode, setMode] = useState<LearnMode>("flashcard");

  // Session batch (20 words per round so learning is fast and rewarding)
  const [batchOffset, setBatchOffset] = useState(0);
  const BATCH_SIZE = 20;

  const sessionWords = useMemo(() => {
    if (!words.length) return [];
    return words.slice(batchOffset, batchOffset + BATCH_SIZE);
  }, [words, batchOffset]);

  // Flashcard / Quiz / Listening index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [savedWordIds, setSavedWordIds] = useState<number[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);

  // Listening & Spelling state
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingStatus, setSpellingStatus] = useState<"idle" | "correct" | "wrong">("idle");

  // Speed Match state
  const [matchPairs, setMatchPairs] = useState<{ id: string; text: string; wordId: number; type: "en" | "vi" }[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<{ id: string; wordId: number; type: "en" | "vi" } | null>(null);
  const [matchedWordIds, setMatchedWordIds] = useState<number[]>([]);
  const [wrongMatchIds, setWrongMatchIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    setSavedWordIds(saved.map((w: any) => w.id));
  }, []);

  useEffect(() => {
    if (!setId) return;
    if (setId === "saved") {
      const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
      setSet({ id: "saved", name: "Sổ Tay Từ Vựng Đã Lưu" });
      setWords(saved);
      return;
    }

    const builtIn = BUILTIN_VOCAB_SETS.find((s) => String(s.id) === String(setId));
    if (builtIn) {
      setSet(builtIn);
      setWords(builtIn.words);
    }

    axios
      .get(`${API_URL}/vocabulary-sets/${setId}`)
      .then(async (res) => {
        const data = res.data;
        setSet(data);
        let list = data.words || [];

        // Translate first 60 words if missing Vietnamese translation
        const untranslated = list.filter((w: any) => !w.translation).slice(0, 60);
        if (untranslated.length > 0) {
          try {
            const tRes = await axios.post(`${API_URL}/videos/translate`, {
              text: untranslated.map((u: any) => u.word).join("\n"),
            });
            const translated = (tRes.data.text || "").split("\n");
            let j = 0;
            list = list.map((w: any) => {
              if (!w.translation && untranslated.some((u: any) => u.id === w.id)) {
                w.translation = translated[j] || "Từ vựng thông dụng";
                j++;
              }
              return w;
            });
          } catch {}
        }
        setWords(list);
      })
      .catch(() => {
        if (!builtIn) router.push("/vocabulary");
      });
  }, [setId, router]);

  const currentWord = sessionWords[currentIndex];

  // Auto-enrich real dictionary example/phonetic when viewing a placeholder word
  useEffect(() => {
    if (!currentWord) return;
    speakEnglish(currentWord.word);

    if (
      currentWord.definition?.startsWith("Definition of ") ||
      currentWord.definition?.startsWith("We often use ")
    ) {
      lookupWordDictionary(currentWord.word).then((dict) => {
        setWords((prev) =>
          prev.map((w) =>
            w.id === currentWord.id
              ? {
                  ...w,
                  phonetic: dict.phonetic || w.phonetic,
                  definition: dict.example
                    ? `${dict.definitionEn} — Ví dụ: "${dict.example}"`
                    : dict.definitionEn || w.definition,
                }
              : w
          )
        );
      });
    }
  }, [currentIndex, mode, batchOffset, currentWord?.id]);

  // Generate 4 multiple-choice options whenever currentWord changes
  useEffect(() => {
    if (!currentWord || !sessionWords.length) return;
    const correctTrans = currentWord.translation || "Từ vựng thông dụng";
    const others = sessionWords
      .filter((w) => w.id !== currentWord.id && w.translation)
      .map((w) => w.translation);
    const fallbacks = ["Sự phát triển bền vững", "Cơ hội nghề nghiệp", "Hoàn toàn đồng ý", "Lịch trình công việc"];
    const pool = [...new Set([...others, ...fallbacks])].filter((t) => t !== correctTrans);
    const distractors = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [...distractors, correctTrans].sort(() => 0.5 - Math.random());
    setQuizOptions(options);
    setSelectedOption(null);
    setSpellingInput("");
    setSpellingStatus("idle");
  }, [currentIndex, currentWord?.id, sessionWords.length, mode]);

  // Initialize Speed Match board
  useEffect(() => {
    if (mode === "match" && sessionWords.length > 0) {
      initMatchGame();
    }
  }, [mode, sessionWords]);

  const initMatchGame = () => {
    const sample = [...sessionWords].sort(() => 0.5 - Math.random()).slice(0, 6);
    const cards: { id: string; text: string; wordId: number; type: "en" | "vi" }[] = [];
    sample.forEach((w) => {
      cards.push({ id: `en-${w.id}`, text: w.word, wordId: w.id, type: "en" });
      cards.push({ id: `vi-${w.id}`, text: w.translation || w.word, wordId: w.id, type: "vi" });
    });
    setMatchPairs(cards.sort(() => 0.5 - Math.random()));
    setMatchedWordIds([]);
    setSelectedMatch(null);
  };

  const handleMatchClick = (card: { id: string; text: string; wordId: number; type: "en" | "vi" }) => {
    if (matchedWordIds.includes(card.wordId)) return;
    if (card.type === "en") speakEnglish(card.text);

    if (!selectedMatch) {
      setSelectedMatch(card);
      return;
    }
    if (selectedMatch.id === card.id) {
      setSelectedMatch(null);
      return;
    }

    if (selectedMatch.wordId === card.wordId && selectedMatch.type !== card.type) {
      // Match!
      setMatchedWordIds((prev) => [...prev, card.wordId]);
      const matchedWord = sessionWords.find((w) => w.id === card.wordId);
      if (matchedWord) saveSrsWord(matchedWord, "good");
      setSessionScore((s) => s + 15);
      setStreak((st) => st + 1);
      setSelectedMatch(null);
    } else {
      setWrongMatchIds([selectedMatch.id, card.id]);
      setStreak(0);
      setTimeout(() => {
        setWrongMatchIds([]);
        setSelectedMatch(null);
      }, 600);
    }
  };

  const handleSrsRate = (quality: "again" | "hard" | "good" | "easy") => {
    if (!currentWord) return;
    saveSrsWord(currentWord, quality);
    setSessionScore((s) => s + (quality === "easy" ? 15 : quality === "good" ? 10 : 5));
    setIsFlipped(false);
    if (currentIndex < sessionWords.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleQuizAnswer = (option: string) => {
    if (selectedOption || !currentWord) return;
    setSelectedOption(option);
    const isCorrect = option === (currentWord.translation || "Từ vựng thông dụng");
    if (isCorrect) {
      saveSrsWord(currentWord, "good");
      setSessionScore((s) => s + 10);
      setStreak((st) => st + 1);
      speakEnglish(currentWord.word);
      setTimeout(() => {
        if (currentIndex < sessionWords.length - 1) setCurrentIndex((i) => i + 1);
        else setCurrentIndex(0);
      }, 900);
    } else {
      saveSrsWord(currentWord, "again");
      setStreak(0);
    }
  };

  const handleCheckSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord) return;
    if (spellingInput.trim().toLowerCase() === currentWord.word.trim().toLowerCase()) {
      setSpellingStatus("correct");
      saveSrsWord(currentWord, "easy");
      setSessionScore((s) => s + 15);
      setStreak((st) => st + 1);
      speakEnglish(currentWord.word);
      setTimeout(() => {
        if (currentIndex < sessionWords.length - 1) setCurrentIndex((i) => i + 1);
        else setCurrentIndex(0);
      }, 900);
    } else {
      setSpellingStatus("wrong");
      saveSrsWord(currentWord, "again");
      setStreak(0);
    }
  };

  const toggleSaveCurrentWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;
    const saved = JSON.parse(localStorage.getItem(getUserKey("savedWords")) || "[]");
    const isSaved = savedWordIds.includes(currentWord.id);
    if (isSaved) {
      const updated = saved.filter((w: any) => w.id !== currentWord.id);
      localStorage.setItem(getUserKey("savedWords"), JSON.stringify(updated));
      setSavedWordIds(updated.map((w: any) => w.id));
    } else {
      saved.unshift(currentWord);
      localStorage.setItem(getUserKey("savedWords"), JSON.stringify(saved));
      setSavedWordIds(saved.map((w: any) => w.id));
    }
  };

  if (!set || !words.length) return <div className="p-8">Đang chuẩn bị học liệu...</div>;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 h-full flex flex-col justify-between max-w-4xl mx-auto w-full overflow-y-auto gap-4">
      {/* TOP BAR */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(setId === "saved" ? "/vocabulary/saved" : `/vocabulary/${set.id}`)}
            className="text-muted-foreground hover:text-foreground font-semibold text-sm flex items-center gap-1"
          >
            ✕ Thoát
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-amber-500/15 text-amber-500 px-3 py-1 rounded-full">
              🔥 Chuỗi đúng: {streak}
            </span>
            <span className="text-xs font-bold bg-primary/15 text-primary px-3 py-1 rounded-full">
              ⭐ {sessionScore} XP
            </span>
          </div>
        </div>

        {/* 4 WORLD-CLASS LEARNING MODES SELECTOR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-card p-1.5 rounded-2xl border border-border">
          {[
            { id: "flashcard", label: "🃏 1. Flashcard 3D" },
            { id: "quiz", label: "🎯 2. Trắc nghiệm" },
            { id: "listening", label: "🎧 3. Nghe & Gõ từ" },
            { id: "match", label: "⚡ 4. Ghép cặp tốc độ" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as LearnMode);
                setIsFlipped(false);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                mode === m.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* BATCH SELECTOR FOR LARGE SETS (e.g., Oxford 1000) */}
        {words.length > BATCH_SIZE && (
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-xl">
            <span>
              Chặng học: <b>Từ {batchOffset + 1} – {Math.min(words.length, batchOffset + BATCH_SIZE)}</b> / {words.length} từ
            </span>
            <div className="flex gap-2">
              <button
                disabled={batchOffset === 0}
                onClick={() => {
                  setBatchOffset((b) => Math.max(0, b - BATCH_SIZE));
                  setCurrentIndex(0);
                }}
                className="px-2.5 py-1 rounded bg-card border border-border font-bold disabled:opacity-40"
              >
                ← Chặng trước
              </button>
              <button
                disabled={batchOffset + BATCH_SIZE >= words.length}
                onClick={() => {
                  setBatchOffset((b) => b + BATCH_SIZE);
                  setCurrentIndex(0);
                }}
                className="px-2.5 py-1 rounded bg-card border border-border font-bold disabled:opacity-40"
              >
                Chặng tiếp →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODE 1: 3D FLASHCARD + ANKI SRS RATING */}
      {mode === "flashcard" && currentWord && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 my-2">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-xl min-h-[290px] md:min-h-[340px] cursor-pointer relative rounded-3xl shadow-xl border-2 border-border bg-card p-6 md:p-10 flex flex-col items-center justify-center text-center transition-all hover:border-primary/50"
          >
            <div className="absolute top-4 left-5 text-xs font-bold text-muted-foreground">
              Thẻ {currentIndex + 1} / {sessionWords.length}
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={toggleSaveCurrentWord}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border ${
                  savedWordIds.includes(currentWord.id)
                    ? "bg-yellow-400/15 border-yellow-400 text-yellow-400"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                {savedWordIds.includes(currentWord.id) ? "★" : "☆"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakEnglish(currentWord.word);
                }}
                className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                🔊
              </button>
            </div>

            {!isFlipped ? (
              <div className="my-4">
                <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-3">{currentWord.word}</h2>
                {currentWord.phonetic && (
                  <p className="text-base md:text-lg text-muted-foreground font-mono">{currentWord.phonetic}</p>
                )}
                <p className="text-xs text-muted-foreground mt-8 bg-secondary px-4 py-1.5 rounded-full inline-block">
                  👆 Chạm vào thẻ để lật xem nghĩa & câu ví dụ
                </p>
              </div>
            ) : (
              <div className="my-2 space-y-3">
                <div className="text-sm font-bold text-muted-foreground">
                  {currentWord.word} {currentWord.phonetic}
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-500">
                  {currentWord.translation || "Từ vựng cốt lõi"}
                </div>
                <p className="text-sm md:text-base text-foreground/90 leading-relaxed max-w-md bg-secondary/60 p-3.5 rounded-2xl">
                  {currentWord.definition}
                </p>
              </div>
            )}
          </div>

          {/* SRS RATING BUTTONS */}
          <div className="w-full max-w-xl">
            <p className="text-center text-xs text-muted-foreground mb-2">
              Đánh giá mức độ nhớ của bạn để thuật toán SRS tự lên lịch ôn tập:
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              <button
                onClick={() => handleSrsRate("again")}
                className="py-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 font-bold text-xs md:text-sm hover:bg-red-500 hover:text-white transition-colors"
              >
                😓 Quên rồi
                <span className="block text-[10px] opacity-75 font-normal">10 phút</span>
              </button>
              <button
                onClick={() => handleSrsRate("hard")}
                className="py-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold text-xs md:text-sm hover:bg-amber-500 hover:text-black transition-colors"
              >
                🤔 Hơi khó
                <span className="block text-[10px] opacity-75 font-normal">4 giờ</span>
              </button>
              <button
                onClick={() => handleSrsRate("good")}
                className="py-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500 font-bold text-xs md:text-sm hover:bg-blue-500 hover:text-white transition-colors"
              >
                👍 Nhớ tốt
                <span className="block text-[10px] opacity-75 font-normal">1 ngày</span>
              </button>
              <button
                onClick={() => handleSrsRate("easy")}
                className="py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold text-xs md:text-sm hover:bg-emerald-500 hover:text-white transition-colors"
              >
                ⚡ Quá dễ
                <span className="block text-[10px] opacity-75 font-normal">4 ngày</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: MULTIPLE CHOICE QUIZ */}
      {mode === "quiz" && currentWord && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-5">
          <div className="w-full bg-card border border-border rounded-3xl p-6 md:p-8 text-center shadow-lg">
            <span className="text-xs font-bold uppercase text-muted-foreground">
              Câu {currentIndex + 1} / {sessionWords.length} · Chọn nghĩa đúng
            </span>
            <div className="flex items-center justify-center gap-3 mt-3">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary">{currentWord.word}</h2>
              <button
                onClick={() => speakEnglish(currentWord.word)}
                className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center"
              >
                🔊
              </button>
            </div>
            {currentWord.phonetic && (
              <p className="text-sm text-muted-foreground font-mono mt-1">{currentWord.phonetic}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 w-full">
            {quizOptions.map((opt, idx) => {
              const isCorrect = opt === (currentWord.translation || "Từ vựng thông dụng");
              const isSelected = selectedOption === opt;
              let btnStyle = "bg-card border-border hover:border-primary";
              if (selectedOption) {
                if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-500";
                else if (isSelected) btnStyle = "bg-red-500/20 border-red-500 text-red-500";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleQuizAnswer(opt)}
                  className={`w-full p-4 rounded-2xl border-2 text-left font-bold text-base transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>
                    {idx + 1}. {opt}
                  </span>
                  {selectedOption && isCorrect && <span>✓ Chính xác</span>}
                  {selectedOption && isSelected && !isCorrect && <span>✕ Sai rồi</span>}
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <button
              onClick={() => {
                if (currentIndex < sessionWords.length - 1) setCurrentIndex((i) => i + 1);
                else setCurrentIndex(0);
              }}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold"
            >
              Câu tiếp theo →
            </button>
          )}
        </div>
      )}

      {/* MODE 3: LISTENING & SPELLING DICTATION */}
      {mode === "listening" && currentWord && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-5">
          <div className="w-full bg-card border border-border rounded-3xl p-6 md:p-8 text-center shadow-lg space-y-4">
            <span className="text-xs font-bold uppercase text-muted-foreground">
              Nghe phát âm & Gõ lại từ tiếng Anh
            </span>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => speakEnglish(currentWord.word, 0.95)}
                className="px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-md hover:opacity-90 flex items-center gap-2"
              >
                🔊 Nghe từ
              </button>
              <button
                onClick={() => speakEnglish(currentWord.word, 0.65)}
                className="px-4 py-4 rounded-2xl bg-secondary font-bold text-sm hover:opacity-90"
              >
                🐢 Nghe chậm
              </button>
            </div>

            <div className="text-base font-bold text-emerald-500">
              Nghĩa: {currentWord.translation || "Từ vựng cốt lõi"}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Gợi ý số chữ cái: {currentWord.word[0]}
              {" _".repeat(Math.max(1, currentWord.word.length - 1))} ({currentWord.word.length} ký tự)
            </div>

            <form onSubmit={handleCheckSpelling} className="space-y-3 pt-2">
              <input
                value={spellingInput}
                onChange={(e) => {
                  setSpellingInput(e.target.value);
                  setSpellingStatus("idle");
                }}
                placeholder="Gõ từ tiếng Anh bạn nghe được..."
                className="w-full px-4 py-3.5 rounded-2xl bg-background border-2 border-border focus:outline-none focus:border-primary text-center text-xl font-bold"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base"
              >
                Kiểm tra chính tả
              </button>
            </form>

            {spellingStatus === "correct" && (
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-500 font-bold">
                🎉 Tuyệt vời! Chính xác: {currentWord.word} ({currentWord.phonetic})
              </div>
            )}
            {spellingStatus === "wrong" && (
              <div className="p-3 rounded-xl bg-red-500/15 text-red-500 font-bold">
                Đáp án đúng là: <span className="underline">{currentWord.word}</span> ({currentWord.phonetic})
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 4: SPEED WORD MATCHING */}
      {mode === "match" && (
        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Chạm chọn 1 từ Tiếng Anh và 1 nghĩa Tiếng Việt tương ứng:
            </p>
            <button
              onClick={initMatchGame}
              className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-bold hover:opacity-90"
            >
              🔄 Đổi bàn mới
            </button>
          </div>

          {matchedWordIds.length === 6 ? (
            <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-4">
              <div className="text-5xl">🏆</div>
              <h3 className="text-2xl font-bold">Hoàn thành xuất sắc 6 cặp từ!</h3>
              <button
                onClick={initMatchGame}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
              >
                Chơi tiếp 6 cặp từ khác →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {matchPairs.map((card) => {
                const isMatched = matchedWordIds.includes(card.wordId);
                const isSelected = selectedMatch?.id === card.id;
                const isWrong = wrongMatchIds.includes(card.id);

                return (
                  <button
                    key={card.id}
                    disabled={isMatched}
                    onClick={() => handleMatchClick(card)}
                    className={`min-h-[84px] p-3 rounded-2xl border-2 font-bold text-sm md:text-base transition-all flex items-center justify-center text-center ${
                      isMatched
                        ? "opacity-20 border-emerald-500 bg-emerald-500/10 cursor-default scale-95"
                        : isWrong
                        ? "border-red-500 bg-red-500/20 text-red-500 animate-shake"
                        : isSelected
                        ? "border-primary bg-primary/15 text-primary scale-105 shadow-md"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    {card.text}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PROGRESS BAR */}
      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden shrink-0">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / Math.max(1, sessionWords.length)) * 100}%` }}
        />
      </div>
    </div>
  );
}
