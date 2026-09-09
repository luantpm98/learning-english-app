import { useState } from "react";
import { phrases as initialPhrases, phraseCategories, type Phrase } from "../data";

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>(initialPhrases);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = phrases.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = p.en.toLowerCase().includes(search.toLowerCase()) || p.vi.includes(search);
    return matchCat && matchSearch;
  });

  const toggleSave = (id: string) => {
    setPhrases((prev) => prev.map((p) => p.id === id ? { ...p, saved: !p.saved } : p));
  };

  const savedCount = phrases.filter((p) => p.saved).length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Common Phrases</h1>
            <p className="text-sm text-[var(--muted-foreground)]">{phrases.length} phrases · {savedCount} saved to practice</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search phrases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {phraseCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Phrases list */}
        <div className="flex flex-col gap-3">
          {filtered.map((phrase) => (
            <div
              key={phrase.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                phrase.saved
                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] mb-1 leading-relaxed">{phrase.en}</p>
                <p className="text-xs text-[var(--accent)] leading-relaxed">{phrase.vi}</p>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
                  {phrase.category}
                </span>
              </div>
              <button
                onClick={() => toggleSave(phrase.id)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  phrase.saved
                    ? "bg-[var(--accent)] text-white hover:opacity-80"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {phrase.saved ? "✓ Saved" : "+ Save"}
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--muted-foreground)]">
              <div className="text-3xl mb-2">❝</div>
              <p className="text-sm">No phrases found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
