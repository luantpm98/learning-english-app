"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/auth");
    } else {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchDashboard(parsed.id);
    }
  }, [router]);

  const fetchDashboard = async (id: number) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/users/${id}/dashboard`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || !data) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto gap-8">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary to-blue-600 text-white p-8 rounded-3xl shadow-lg">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.username}!</h1>
          <p className="opacity-90 text-lg">Ready to continue your English journey?</p>
        </div>
        <div className="bg-white/20 p-4 rounded-2xl text-center min-w-[120px] backdrop-blur-sm">
          <div className="text-4xl font-bold">{data.streak} 🔥</div>
          <div className="text-sm font-medium mt-1">Day Streak</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT VIDEO */}
        <div className="bg-card p-6 rounded-3xl border border-border flex flex-col shadow-sm lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">▶ Continue Watching</h2>
          {data.recentVideo ? (
            <Link href={`/videos/${data.recentVideo.id}`} className="group relative rounded-xl overflow-hidden aspect-video bg-black block mb-4">
              <img src={`https://img.youtube.com/vi/${data.recentVideo.youtubeId}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="video" />
              <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-white font-bold line-clamp-2">{data.recentVideo.title}</span>
              </div>
            </Link>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl p-6">
              <p className="mb-4 text-center">You haven't watched any videos yet.</p>
              <Link href="/videos" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">Browse Videos</Link>
            </div>
          )}
        </div>

        {/* RECENT WORDS */}
        <div className="bg-card p-6 rounded-3xl border border-border flex flex-col shadow-sm lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">📖 Recently Learned</h2>
            <Link href="/vocabulary" className="text-sm text-primary font-medium hover:underline">Go to sets</Link>
          </div>
          {data.recentWords?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.recentWords.map((w: any) => (
                <div key={w.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border">
                  <div className="font-bold text-lg text-primary">{w.word}</div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-muted-foreground text-center">No words learned recently.</div>
          )}
        </div>

        {/* REVIEW WORDS */}
        <div className="bg-card p-6 rounded-3xl border border-border flex flex-col shadow-sm lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">📚 Words to Review</h2>
            <Link href="/vocabulary" className="text-sm text-primary font-medium hover:underline">Go to sets</Link>
          </div>
          {data.reviewWords?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.reviewWords.map((w: any) => (
                <div key={w.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border">
                  <div className="font-bold text-lg text-primary">{w.word}</div>
                  <div className="text-xs text-muted-foreground uppercase bg-background px-2 py-1 rounded">Needs Review</div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-muted-foreground text-center">No words to review today!</div>
          )}
        </div>

        {/* REFLEX PHRASES */}
        <div className="bg-card p-6 rounded-3xl border border-border flex flex-col shadow-sm lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">⚡ Reflex Training Today</h2>
            <Link href="/reflex" className="text-sm text-primary font-medium hover:underline">Start Training</Link>
          </div>
          {data.phrases?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {data.phrases.map((p: any) => (
                <div key={p.id} className="p-3 bg-muted/30 rounded-xl border border-border">
                  <div className="font-medium text-sm line-clamp-2">{p.text}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl p-6 text-center">
              <p className="mb-4">No phrases saved yet.</p>
              <Link href="/videos" className="text-primary font-medium">Watch and save phrases</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
