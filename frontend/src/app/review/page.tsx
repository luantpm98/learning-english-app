export default function ReviewPage() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center">
      <div className="text-6xl mb-4">◷</div>
      <h1 className="text-3xl font-bold mb-2">Daily Review</h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Your daily spaced-repetition (SRS) flashcards will appear here based on the vocabularies and videos you studied.
        <br/><br/>
        <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">Coming soon</span>
      </p>
    </div>
  );
}
