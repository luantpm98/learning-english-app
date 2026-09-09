"use client";
import { getUserKey } from "../../utils/storage";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VideoLibraryPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [myChannels, setMyChannels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ type: 'video'|'channel', data: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "channels" | "saved">("discover");
  
  // States for channel view
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [channelContent, setChannelContent] = useState<{playlists: any[], latestVideos: any[]} | null>(null);
  const [loadingChannel, setLoadingChannel] = useState(false);

  // States for playlist view
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [activePlaylistTitle, setActivePlaylistTitle] = useState<string>("");
  const [playlistVideos, setPlaylistVideos] = useState<any[]>([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [importingAll, setImportingAll] = useState(false);

  // Recommendations based on history
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchSaved();
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    const history = JSON.parse(localStorage.getItem(getUserKey("searchHistory")) || "[]");
    try {
      if (history.length > 0) {
        // Pick up to 3 random topics from history
        const shuffled = [...history].sort(() => 0.5 - Math.random()).slice(0, 3);
        const promises = shuffled.map(q => axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/videos/search?q=${encodeURIComponent(q)}`));
        const results = await Promise.all(promises);
        let combined: any[] = [];
        results.forEach(res => combined.push(...res.data));
        // Shuffle and take 12
        combined = combined.sort(() => 0.5 - Math.random()).slice(0, 12);
        setRecommendations(combined);
      } else {
        // Default fallback for new users
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/videos/search?q=english%20listening`);
        setRecommendations(res.data);
      }
    } catch(e) {
      console.error("Failed to load recommendations", e);
    }
  };

  const fetchSaved = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) {
        router.push("/auth");
        return;
      }
      const user = JSON.parse(stored);
      const [vRes, cRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/videos`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/channels?userId=${user.id}`)
      ]);
      
      let savedIds = JSON.parse(localStorage.getItem(getUserKey("savedVideoIds")) || "null");
      if (savedIds === null) {
         savedIds = vRes.data.map((v: any) => v.id);
         localStorage.setItem(getUserKey("savedVideoIds"), JSON.stringify(savedIds));
      }
      setVideos(vRes.data.filter((v: any) => savedIds.includes(v.id)));
      setMyChannels(cRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Save to history
    const history = JSON.parse(localStorage.getItem(getUserKey("searchHistory")) || "[]");
    const query = searchQuery.trim().toLowerCase();
    if (!history.includes(query)) {
      history.unshift(query);
      if (history.length > 20) history.pop();
      localStorage.setItem(getUserKey("searchHistory"), JSON.stringify(history));
    }

    setLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/videos/search?q=${encodeURIComponent(searchQuery)}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/videos/search-channel?q=${encodeURIComponent(searchQuery)}`)
      ]);
      const combined = [
        ...cRes.data.map((c: any) => ({ type: 'channel', data: c })),
        ...vRes.data.map((v: any) => ({ type: 'video', data: v }))
      ];
      setSearchResults(combined);
      setActiveTab("discover");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeChannel = async (channel: any) => {
    try {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : {id: 1};
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/channels/subscribe`, {
        userId: user.id,
        youtubeChannelId: channel.channelId,
        name: channel.name,
        thumbnail: channel.thumbnail,
        subCount: channel.subCount
      });
      alert("Subscribed!");
      fetchSaved();
    } catch (e) {
      console.error(e);
      alert("Failed to subscribe");
    }
  };

  const unsubscribeChannel = async (id: number) => {
    try {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : {id: 1};
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/channels/${id}/unsubscribe?userId=${user.id}`);
      fetchSaved();
    } catch (e) {
      console.error(e);
    }
  };

  const viewChannel = async (channel: any) => {
    setActiveChannelId(channel.channelId || channel.name);
    setChannelContent(null);
    setLoadingChannel(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/videos/channel-videos?q=${encodeURIComponent(channel.channelId || channel.name)}`);
      setChannelContent(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChannel(false);
    }
  };

  const viewPlaylist = async (playlist: any) => {
    setActivePlaylistId(playlist.id);
    setActivePlaylistTitle(playlist.title);
    setLoadingPlaylist(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/videos/playlist-videos?playlistId=${playlist.id}`);
      setPlaylistVideos(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load playlist videos");
    } finally {
      setLoadingPlaylist(false);
    }
  };

  const importVideo = async (youtubeId: string, title: string, author?: string, playlistId?: string, playlistName?: string) => {
    try {
      const payload: any = { youtubeId, title };
      if (author) payload.author = author;
      if (playlistId) payload.playlistId = playlistId;
      if (playlistName) payload.playlistName = playlistName;
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/videos`, payload);
      router.push(`/videos/${res.data.id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to import video. It might lack subtitles.");
    }
  };

  const importAllVideos = async () => {
    if (!playlistVideos.length) return;
    const confirm = window.confirm(`Are you sure you want to add ${playlistVideos.length} videos to your library? This might take a while depending on the amount of videos.`);
    if (!confirm) return;
    
    setImportingAll(true);
    let successCount = 0;
    const savedIds = JSON.parse(localStorage.getItem(getUserKey("savedVideoIds")) || "[]");
    
    for (const v of playlistVideos) {
      try {
        const payload: any = { youtubeId: v.youtubeId, title: v.title, author: v.author };
        if (activePlaylistId) payload.playlistId = activePlaylistId;
        if (activePlaylistTitle) payload.playlistName = activePlaylistTitle;
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/videos`, payload);
        
        if (!savedIds.includes(res.data.id)) {
          savedIds.push(res.data.id);
        }
        successCount++;
      } catch (e) {
        console.error("Failed to import", v.title);
      }
    }
    localStorage.setItem(getUserKey("savedVideoIds"), JSON.stringify(savedIds));
    setImportingAll(false);
    alert(`Successfully added ${successCount}/${playlistVideos.length} videos to your library!`);
    fetchSaved(); // refresh saved tab data just in case
  };

  const unsaveVideo = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this video from your saved list?")) return;
    try {
      const savedIds = JSON.parse(localStorage.getItem(getUserKey("savedVideoIds")) || "[]");
      const updated = savedIds.filter((vId: number) => vId !== id);
      localStorage.setItem(getUserKey("savedVideoIds"), JSON.stringify(updated));
      fetchSaved();
    } catch (err) {
      console.error(err);
      alert("Failed to unsave video");
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col">
      {/* 4-English Style Header with Search */}
      <div className="bg-card border-b border-border p-6 flex flex-col gap-6 shrink-0 shadow-sm z-10 sticky top-0">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Video Library</h1>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">🔍</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, channels, or paste YouTube URL..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-background border-2 border-border focus:outline-none focus:border-primary text-lg transition-colors shadow-inner"
            />
          </div>
          <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md">
            {loading ? "..." : "Search"}
          </button>
        </form>

        <div className="flex gap-8 border-b border-border pb-1">
          <button 
            className={`pb-3 font-bold text-lg transition-colors relative ${activeTab === 'discover' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('discover'); setActiveChannelId(null); }}
          >
            Discover
            {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
          </button>
          <button 
            className={`pb-3 font-bold text-lg transition-colors relative ${activeTab === 'channels' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('channels'); setActiveChannelId(null); }}
          >
            My Channels ({myChannels.length})
            {activeTab === 'channels' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
          </button>
          <button 
            className={`pb-3 font-bold text-lg transition-colors relative ${activeTab === 'saved' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('saved'); setActiveChannelId(null); }}
          >
            Saved Videos ({videos.length})
            {activeTab === 'saved' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 bg-background">
        
        {/* DISCOVER TAB */}
        {activeTab === 'discover' && !activeChannelId && (
          <div>
            {searchResults.length === 0 ? (
              <div className="space-y-8">
                {recommendations.length > 0 ? (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">✨ Đề xuất cho bạn (Dựa trên lịch sử)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {recommendations.map((video, idx) => (
                        <div key={idx} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer" onClick={() => importVideo(video.youtubeId, video.title)}>
                          <div className="relative aspect-video overflow-hidden">
                            <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="thumbnail" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                 <span>▶</span> Study
                               </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold line-clamp-2 mb-2 text-[15px] group-hover:text-primary transition-colors">{video.title}</h3>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span className="truncate pr-4">{video.author}</span>
                              <span className="shrink-0 bg-secondary px-2 py-0.5 rounded text-xs">{video.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-20">
                    <div className="text-6xl mb-4">📺</div>
                    <h2 className="text-2xl font-bold mb-2">Search for content</h2>
                    <p>Find English channels or videos to study with.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-12">
                {searchResults.filter(item => item.type === 'channel').length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📺 Channels</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {searchResults.filter(item => item.type === 'channel').map((item, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow">
                          <img src={item.data.thumbnail} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-background shadow-sm" alt="channel" />
                          <h3 className="font-bold text-xl mb-1 line-clamp-1">{item.data.name}</h3>
                          <p className="text-sm text-muted-foreground mb-6">{item.data.subCount}</p>
                          
                          <div className="mt-auto flex gap-3 w-full">
                            <button onClick={() => viewChannel(item.data)} className="flex-1 bg-secondary text-foreground py-2 rounded-xl font-medium hover:bg-secondary/80">View</button>
                            {!myChannels.find(c => c.youtubeChannelId === item.data.channelId) && (
                               <button onClick={() => subscribeChannel(item.data)} className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl font-bold hover:opacity-90">Follow</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.filter(item => item.type === 'video').length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🎬 Videos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {searchResults.filter(item => item.type === 'video').map((item, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                          <div className="relative aspect-video">
                            <img src={item.data.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">{item.data.duration}</span>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-base leading-tight mb-2 line-clamp-3">{item.data.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{item.data.author}</p>
                            <button onClick={() => importVideo(item.data.youtubeId, item.data.title)} className="mt-auto w-full bg-primary/10 text-primary py-2 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors">
                              Study Video
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PLAYLIST DETAIL VIEW */}
        {activePlaylistId && (
          <div>
            <button onClick={() => setActivePlaylistId(null)} className="mb-6 text-muted-foreground hover:text-foreground font-medium flex items-center gap-2">
              ← Back to channel
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-3xl font-bold">{activePlaylistTitle}</h2>
              {!loadingPlaylist && playlistVideos.length > 0 && (
                <button disabled={importingAll} onClick={importAllVideos} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  <span>{importingAll ? "⏳" : "+"}</span> {importingAll ? "Adding..." : "Add All to Library"}
                </button>
              )}
            </div>
            {loadingPlaylist ? (
               <div className="text-center py-20 text-muted-foreground">Loading playlist videos...</div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {playlistVideos.map((v: any, idx) => (
                    <div key={idx} onClick={() => importVideo(v.youtubeId, v.title, v.author, activePlaylistId!, activePlaylistTitle)} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer group">
                      <div className="relative aspect-video">
                        <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="thumbnail" />
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">{v.duration}</span>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                           <span className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-full">Learn with Video</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-base line-clamp-3 group-hover:text-primary transition-colors">{v.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{v.author}</p>
                      </div>
                    </div>
                  ))}
               </div>
            )}
          </div>
        )}

        {/* CHANNEL DETAIL VIEW */}
        {activeChannelId && !activePlaylistId && (
          <div>
            <button onClick={() => setActiveChannelId(null)} className="mb-6 text-muted-foreground hover:text-foreground font-medium flex items-center gap-2">
              ← Back to results
            </button>
            
            {loadingChannel ? (
              <div className="text-center py-20 text-muted-foreground">Loading channel content...</div>
            ) : channelContent ? (
              <div className="space-y-12">
                {/* Playlists */}
                {channelContent.playlists.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📑 Playlists</h2>
                    <div className="flex overflow-x-auto gap-6 pb-4 snap-x">
                      {channelContent.playlists.map(p => (
                        <div key={p.id} onClick={() => viewPlaylist(p)} className="min-w-[280px] md:min-w-[320px] snap-start bg-card border border-border rounded-2xl overflow-hidden shadow-sm group cursor-pointer hover:shadow-md transition-all">
                          <div className="relative aspect-video">
                            <img src={p.thumbnail} className="w-full h-full object-cover" alt="playlist" />
                            <div className="absolute inset-y-0 right-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                              <span className="text-2xl mb-1">≡</span>
                              <span className="text-sm font-medium">{p.videoCount}</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-base line-clamp-3 group-hover:text-primary transition-colors">{p.title}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest Videos */}
                <div>
                   <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🔥 Latest Videos</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {channelContent.latestVideos.map((v: any, idx) => (
                         <div key={idx} onClick={() => router.push(`/videos/${v.id}`)} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer">
                            <div className="relative aspect-video">
                              <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="thumbnail" />
                              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">{v.duration}</span>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                              <h3 className="font-bold text-base leading-tight mb-2 line-clamp-3">{v.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4">{v.author}</p>
                              <button onClick={(e) => { e.stopPropagation(); importVideo(v.youtubeId, v.title, v.author); }} className="mt-auto w-full bg-primary/10 text-primary py-2 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors">
                                Study Video
                              </button>
                            </div>
                          </div>
                      ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">Failed to load channel.</div>
            )}
          </div>
        )}

        {/* CHANNELS TAB */}
        {activeTab === 'channels' && !activeChannelId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myChannels.length === 0 ? (
               <div className="col-span-full text-center text-muted-foreground py-10">You haven't followed any channels yet.</div>
            ) : (
              myChannels.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center text-center shadow-md">
                  <img src={c.thumbnail} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-background" alt="channel" />
                  <h3 className="font-bold text-xl mb-1 line-clamp-1">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{c.subCount}</p>
                  
                  <div className="mt-auto flex gap-3 w-full">
                    <button onClick={() => viewChannel(c)} className="flex-1 bg-secondary text-foreground py-2 rounded-xl font-medium hover:bg-secondary/80">View</button>
                    <button onClick={() => unsubscribeChannel(c.id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl font-bold hover:bg-red-200">Unfollow</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SAVED TAB */}
        {activeTab === 'saved' && !activeChannelId && (
          <div className="space-y-10">
            {videos.length === 0 ? (
               <div className="col-span-full text-center text-muted-foreground py-10">You haven't saved any videos yet.</div>
            ) : (
              Object.entries(
                videos.reduce((acc: any, v: any) => {
                  const channel = v.author || "Other Channels";
                  const playlist = v.playlistName || "All Videos";
                  if (!acc[channel]) acc[channel] = {};
                  if (!acc[channel][playlist]) acc[channel][playlist] = [];
                  acc[channel][playlist].push(v);
                  return acc;
                }, {})
              ).map(([channelName, playlists]: any, cIdx) => (
                <div key={cIdx} className="bg-card/30 rounded-2xl p-6 border border-border">
                  <h2 className="text-2xl font-bold mb-6 border-b border-border pb-3 text-primary">{channelName}</h2>
                  
                  <div className="space-y-8">
                    {Object.entries(playlists).map(([playlistName, pVideos]: any, pIdx) => (
                      <div key={pIdx}>
                        {playlistName !== "All Videos" && <h3 className="text-xl font-semibold mb-4 opacity-90 text-foreground flex items-center gap-2"><span className="text-muted-foreground">▶</span> {playlistName}</h3>}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {pVideos.map((v: any) => (
                            <div key={v.id} onClick={() => router.push(`/videos/${v.id}`)} className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer">
                              <div className="relative aspect-video bg-black">
                                <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="thumbnail" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 z-10">
                                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl pl-1 shadow-lg">▶</div>
                                </div>
                                <button onClick={(e) => unsaveVideo(e, v.id)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all z-20" title="Remove from saved">
                                  ✕
                                </button>
                              </div>
                              <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-base leading-tight mb-2 line-clamp-3 group-hover:text-primary transition-colors">{v.title}</h3>
                                <div className="mt-auto flex justify-between items-center text-sm text-muted-foreground">
                                   <span>{v.level || "Intermediate"}</span>
                                   <span className="bg-secondary px-2 py-1 rounded">Saved</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
