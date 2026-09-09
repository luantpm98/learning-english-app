import { useState } from "react";
import { vocabulary as initialVocab, collectionWords, wordCollections, type VocabWord } from "../data";

type Tab = "my-words" | "collections";

const levelColors = ["bg-[var(--secondary)] text-[var(--muted-foreground)]", "bg-red-500/20 text-red-400", "bg-yellow-500/20 text-yellow-400", "bg-blue-500/20 text-blue-400", "bg-green-500/20 text-green-300", "bg-purple-500/20 text-purple-400"];
const levelLabels = ["New", "New", "Learning", "Familiar", "Known", "Mastered"];

export default function VocabularyPage() {
  const [tab, setTab] = useState<Tab>("my-words");
  const [words, setWords] = useState<VocabWord[]>(initialVocab);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VocabWord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", phonetic: "", meaning: "", example: "" });

  // Collections tab
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [colSearch, setColSearch] = useState("");

  const filtered = words.filter((w) =>
    w.word.toLowerCase().includes(search.toLowerCase()) || w.meaning.includes(search)
  );

  const dueToday = words.filter((w) => w.nextReview <= "2026-08-30");

  const addWord = () => {
    if (!newWord.word.trim()) return;
    const word: VocabWord = {
      id: `w${Date.now()}`,
      word: newWord.word,
      phonetic: newWord.phonetic,
      meaning: newWord.meaning,
      example: newWord.example,
      nextReview: "2026-08-30",
      level: 1,
    };
    setWords((p) => [word, ...p]);
    setNewWord({ word: "", phonetic: "", meaning: "", example: "" });
    setShowAdd(false);
  };

  const deleteWord = (id: string) => {
    setWords((p) => p.filter((w) => w.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const addFromCollection = (cw: VocabWord) => {
    if (words.some((w) => w.word.toLowerCase() === cw.word.toLowerCase())) return;
    setWords((p) => [...p, { ...cw, id: `w${Date.now()}`, level: 1, nextReview: "2026-08-30", collectionId: undefined }]);
  };

  const isInMyWords = (word: string) => words.some((w) => w.word.toLowerCase() === word.toLowerCase());

  const colWords = collectionWords.filter((cw) => {
    const matchCol = !selectedCollection || cw.collectionId === selectedCollection;
    const matchSearch = cw.word.toLowerCase().includes(colSearch.toLowerCase()) || cw.meaning.includes(colSearch);
    return matchCol && matchSearch;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 border-r border-[var(--border)] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          {(["my-words", "collections"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(null); setShowAdd(false); }}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${tab === t ? "border-b-2 border-[var(--primary)] text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              {t === "my-words" ? `My Words (${words.length})` : "Collections"}
            </button>
          ))}
        </div>

        {tab === "my-words" ? (
          <>
            <div className="p-3 border-b border-[var(--border)]">
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  placeholder="Search words..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={() => { setShowAdd(true); setSelected(null); }}
                  className="px-3 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-xs font-semibold hover:opacity-90"
                >
                  + Add
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-[var(--secondary)] rounded-lg px-2.5 py-1.5 text-xs text-center">
                  <span className="font-semibold text-[var(--foreground)]">{words.length}</span>
                  <span className="text-[var(--muted-foreground)]"> total</span>
                </div>
                <div className="flex-1 bg-yellow-500/10 rounded-lg px-2.5 py-1.5 text-xs text-center text-yellow-400">
                  <span className="font-semibold">{dueToday.length}</span>
                  <span className="opacity-70"> due</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((w) => (
                <button
                  key={w.id}
                  onClick={() => { setSelected(w); setShowAdd(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)] ${selected?.id === w.id ? "bg-[var(--secondary)]" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--foreground)] truncate">{w.word}</div>
                    <div className="text-xs text-[var(--muted-foreground)] truncate mono">{w.phonetic}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${levelColors[w.level]}`}>
                    {levelLabels[w.level]}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && <div className="p-8 text-center text-[var(--muted-foreground)] text-sm">No words found</div>}
            </div>
          </>
        ) : (
          <>
            <div className="p-3 border-b border-[var(--border)]">
              <input
                type="text"
                placeholder="Search collection..."
                value={colSearch}
                onChange={(e) => setColSearch(e.target.value)}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Collection selector */}
              <div className="p-3 flex flex-col gap-2">
                <button
                  onClick={() => setSelectedCollection(null)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${!selectedCollection ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)]" : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                >
                  All Collections ({collectionWords.length} words)
                </button>
                {wordCollections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollection(col.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${selectedCollection === col.id ? "border text-white" : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                    style={selectedCollection === col.id ? { backgroundColor: col.color + "20", borderColor: col.color + "40", color: col.color } : {}}
                  >
                    <div className="font-medium">{col.name}</div>
                    <div className="opacity-70 mt-0.5">{col.wordCount.toLocaleString()} words</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right detail / collection grid */}
      <div className="flex-1 overflow-y-auto">
        {tab === "collections" ? (
          <div className="p-6">
            {!selectedCollection && !colSearch && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Word Collections</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Chọn bộ sưu tập bên trái để xem và thêm từ vào danh sách học của bạn.</p>
                <div className="grid grid-cols-2 gap-4 mt-5">
                  {wordCollections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setSelectedCollection(col.id)}
                      className="text-left p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-sm font-bold text-black"
                        style={{ backgroundColor: col.color }}>
                        {col.wordCount >= 1000 ? (col.wordCount / 1000) + "K" : col.wordCount}
                      </div>
                      <div className="font-semibold text-sm text-[var(--foreground)] mb-1">{col.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">{col.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Word cards with images */}
            {(selectedCollection || colSearch) && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    {selectedCollection ? wordCollections.find(c => c.id === selectedCollection)?.name : "Search results"}
                    <span className="text-sm font-normal text-[var(--muted-foreground)] ml-2">({colWords.length} words)</span>
                  </h3>
                  <button
                    onClick={() => {
                      colWords.forEach((cw) => addFromCollection(cw));
                    }}
                    className="text-xs px-3 py-1.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-semibold hover:opacity-90"
                  >
                    + Add All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {colWords.map((cw) => {
                    const inList = isInMyWords(cw.word);
                    return (
                      <div key={cw.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)] transition-colors">
                        {cw.image && (
                          <div className="relative h-32 bg-[var(--muted)]">
                            <img src={cw.image} alt={cw.word} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-2 left-3">
                              <span className="text-white font-bold text-base" style={{ fontFamily: "Outfit,sans-serif" }}>{cw.word}</span>
                              <span className="text-white/70 text-xs ml-2 mono">{cw.phonetic}</span>
                            </div>
                          </div>
                        )}
                        <div className="p-3">
                          {!cw.image && (
                            <div className="font-bold text-[var(--foreground)] mb-0.5">{cw.word}
                              <span className="text-xs font-normal text-[var(--muted-foreground)] ml-2 mono">{cw.phonetic}</span>
                            </div>
                          )}
                          <p className="text-xs text-[var(--accent)] mb-1">{cw.meaning}</p>
                          <p className="text-xs text-[var(--muted-foreground)] italic line-clamp-2">"{cw.example}"</p>
                          <button
                            onClick={() => addFromCollection(cw)}
                            disabled={inList}
                            className={`mt-2.5 w-full py-1.5 rounded-lg text-xs font-medium transition-all ${inList ? "bg-[var(--secondary)] text-[var(--muted-foreground)] cursor-default" : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"}`}
                          >
                            {inList ? "✓ In my list" : "+ Add to my words"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : showAdd ? (
          <div className="p-8 max-w-md">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">Add New Word</h2>
            <div className="flex flex-col gap-4">
              {[
                { key: "word", label: "Word", placeholder: "e.g. Eloquent" },
                { key: "phonetic", label: "Phonetic", placeholder: "e.g. /ˈel.ə.kwənt/" },
                { key: "meaning", label: "Vietnamese Meaning", placeholder: "e.g. Hùng hồn, có sức biểu đạt cao" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(newWord as any)[key]}
                    onChange={(e) => setNewWord((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">Example Sentence</label>
                <textarea
                  placeholder="e.g. The eloquent speaker captivated the entire audience."
                  value={newWord.example}
                  onChange={(e) => setNewWord((p) => ({ ...p, example: e.target.value }))}
                  rows={3}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={addWord} className="flex-1 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-semibold hover:opacity-90">Add Word</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-[var(--secondary)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--muted)]">Cancel</button>
              </div>
            </div>
          </div>
        ) : selected ? (
          <div className="p-8 max-w-md">
            {selected.image && (
              <div className="relative h-40 rounded-xl overflow-hidden mb-5 bg-[var(--muted)]">
                <img src={selected.image} alt={selected.word} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-[var(--foreground)] mb-1" style={{ fontFamily: "Outfit,sans-serif" }}>{selected.word}</h2>
                <div className="mono text-sm text-[var(--accent)]">{selected.phonetic}</div>
              </div>
              <button onClick={() => deleteWord(selected.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">Delete</button>
            </div>

            <div className="flex gap-2 mb-5">
              {[1,2,3,4,5].map((l) => (
                <button
                  key={l}
                  onClick={() => setWords(ws => ws.map(w => w.id === selected.id ? { ...w, level: l } : w))}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${selected.level === l ? levelColors[l] + " ring-1 ring-current" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"}`}
                >
                  {levelLabels[l]}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <div className="text-xs text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Meaning</div>
                <p className="text-sm text-[var(--foreground)]">{selected.meaning}</p>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <div className="text-xs text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Example</div>
                <p className="text-sm text-[var(--foreground)] italic leading-relaxed">"{selected.example}"</p>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[var(--muted-foreground)] mb-0.5">Next Review</div>
                  <div className="text-sm mono text-[var(--foreground)]">{selected.nextReview}</div>
                </div>
                <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${levelColors[selected.level]}`}>
                  Level {selected.level} · {levelLabels[selected.level]}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-[var(--muted-foreground)]">
              <div className="text-5xl mb-3">◈</div>
              <p className="text-sm">Select a word to view details</p>
              <button onClick={() => setShowAdd(true)} className="mt-3 text-xs text-[var(--accent)] hover:underline">
                or add a new word
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
