import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { YoutubeTranscript } from 'youtube-transcript';
// @ts-ignore
import ytSearch from 'yt-search';
import { Innertube } from 'youtubei.js';
import https from 'https';
import axios from 'axios';

const fixUrl = (url?: string) => url?.startsWith("//") ? "https:" + url : url;

@Injectable()
export class VideosService {
  private yt: Innertube;

  constructor(private prisma: PrismaService) {
    this.initYT();
  }

  async initYT() {
    try {
      this.yt = await Innertube.create();
    } catch (e: any) {
      console.warn('Innertube init warning:', e.message);
    }
  }

  async searchYoutube(query: string) {
    if (!this.yt) await this.initYT();
    const result = await this.yt.search(query, { type: 'video' });
    return result.videos.map((v: any) => ({
      youtubeId: v.id,
      title: v.title.text,
      thumbnail: fixUrl(v.thumbnails?.[0]?.url),
      duration: v.duration?.text,
      author: v.author?.name
    }));
  }

  async searchChannel(query: string) {
    if (!this.yt) await this.initYT();
    const result = await this.yt.search(query, { type: 'channel' });
    return result.channels.map((c: any) => ({
      channelId: c.id,
      name: c.author?.name,
      thumbnail: fixUrl(c.author?.thumbnails?.[0]?.url || c.thumbnails?.[0]?.url),
      subCount: c.video_count?.text || c.subscribers?.text || c.subscriber_count?.text || ''
    }));
  }

  async getChannelVideos(channelIdOrUrl: string) {
    try {
      if (!this.yt) await this.initYT();
      
      let query = channelIdOrUrl;
      if (query.includes('/c/') || query.includes('/channel/') || query.includes('/@')) {
        query = query.split('/').pop() || query;
      }

      let channel;
      if (query.startsWith('UC') && query.length === 24) {
        channel = await this.yt.getChannel(query);
      } else {
        const search = await this.yt.search(query, { type: 'channel' });
        const firstChannel = search.channels[0];
        if (!firstChannel) throw new Error("Channel not found");
        channel = await this.yt.getChannel(firstChannel.id);
      }

      let playlists: any[] = [];
      try {
        const playlistsData = await channel.getPlaylists();
        playlists = (playlistsData.playlists || []).map((p: any) => ({
          id: p.id || p.content_id || p.playlistId,
          title: p.title?.text || p.title?.toString() || p.metadata?.title?.text || p.title || '',
          thumbnail: fixUrl(p.thumbnails?.[0]?.url || p.content_image?.primary_thumbnail?.image?.[0]?.url || p.thumbnail?.thumbnails?.[0]?.url || p.image?.sources?.[0]?.url),
          videoCount: p.video_count?.text || p.videoCount || p.content_image?.primary_thumbnail?.overlays?.[0]?.badges?.[0]?.text || ''
        }));
      } catch (e: any) {
        console.log("No playlists tab found or error:", e.message);
      }

      let latestVideos: any[] = [];
      try {
        const videosData = await channel.getVideos();
        latestVideos = (videosData.videos || []).map((v: any) => ({
          youtubeId: v.id || v.content_id || v.videoId,
          title: v.title?.text || v.title?.toString() || v.title || v.metadata?.title?.text || '',
          thumbnail: fixUrl(v.thumbnails?.[0]?.url || v.image?.sources?.[0]?.url || v.thumbnail?.thumbnails?.[0]?.url || v.thumbnail?.url || v.content_image?.image?.[0]?.url),
          duration: v.duration?.text || '',
          author: channel.metadata?.title || ''
        }));
      } catch (e: any) {
        console.log("No videos tab found or error:", e.message);
      }

      return { playlists, latestVideos };
    } catch (e: any) {
      console.error(e);
      return { playlists: [], latestVideos: [] };
    }
  }

  async getPlaylistVideos(playlistId: string) {
    if (!this.yt) await this.initYT();
    const playlist = await this.yt.getPlaylist(playlistId);
    return playlist.items.map((v: any) => ({
      youtubeId: v.id || v.content_id || v.videoId,
      title: v.title?.text || v.title?.toString() || v.metadata?.title?.text || v.title || '',
      thumbnail: fixUrl(v.thumbnails?.[0]?.url || v.image?.sources?.[0]?.url || v.thumbnail?.thumbnails?.[0]?.url || v.thumbnail?.url || v.content_image?.image?.[0]?.url),
      duration: v.duration?.text || '',
      author: v.author?.name || ''
    }));
  }

  private decodeHtmlEntities(str: string): string {
    return String(str || '')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
      .trim()
      .replace(/\s+/g, ' ');
  }

  private formatTranscriptItems(transcriptItems: any[]) {
    return transcriptItems
      .map((item: any, index: number, arr: any[]) => {
        // YoutubeTranscript returns offset/duration in ms (or sometimes seconds if from RapidAPI raw)
        let offsetMs = Number(item.offset);
        let durationMs = Number(item.duration);

        const startTime = offsetMs / 1000;
        const rawEndTime = (offsetMs + durationMs) / 1000;
        const nextStartTime = index < arr.length - 1 ? Number(arr[index + 1].offset) / 1000 : rawEndTime;

        let actualEndTime = Math.min(rawEndTime, nextStartTime);
        if (isNaN(actualEndTime) || actualEndTime <= startTime) {
          actualEndTime = (isNaN(startTime) ? 0 : startTime) + 2.5;
        }

        const text = this.decodeHtmlEntities(item.text);

        return {
          startTime: isNaN(startTime) ? 0 : startTime,
          endTime: isNaN(actualEndTime) ? 2.5 : actualEndTime,
          text,
        };
      })
      .filter((s) => s.text.length > 0);
  }

  async fetchSubtitlesForYoutubeId(youtubeId: string): Promise<{ startTime: number; endTime: number; text: string }[]> {
    let transcriptItems: any[] = [];

    // Strategy 1: YoutubeTranscript (direct fetch with English preference, fallback to default language)
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeId, { lang: 'en' });
    } catch {
      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeId);
      } catch (err: any) {
        console.log(`Direct YoutubeTranscript failed for ${youtubeId}:`, err.message);
      }
    }

    // Strategy 2: RapidAPI youtube-transcript3 directly
    if (!transcriptItems || transcriptItems.length === 0) {
      try {
        const url = `https://youtube-transcript3.p.rapidapi.com/api/transcript-with-url?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${youtubeId}&flat_text=false&lang=en`;
        const res = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY || '8aec6454ffmsh254d9e2a11ca4bdp19adebjsne80b0c64a362',
          },
          timeout: 12000,
        });
        if (res.data?.success && Array.isArray(res.data?.transcript) && res.data.transcript.length > 0) {
          transcriptItems = res.data.transcript.map((item: any) => ({
            text: item.text,
            duration: parseFloat(item.duration) * 1000,
            offset: parseFloat(item.offset) * 1000,
          }));
        }
      } catch (rapidErr: any) {
        console.log(`RapidAPI transcript failed for ${youtubeId}:`, rapidErr.message);
      }
    }

    // Strategy 3: Vercel proxy fallback
    if (!transcriptItems || transcriptItems.length === 0) {
      try {
        const data: any = await new Promise((resolve, reject) => {
          https.get(`https://learning-english-app-henna.vercel.app/api/transcript?videoId=${youtubeId}`, (res: any) => {
            let body = '';
            res.on('data', (chunk: any) => (body += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(body));
              } catch (e) {
                reject(e);
              }
            });
          }).on('error', reject);
        });

        if (data && Array.isArray(data.transcript) && data.transcript.length > 0) {
          transcriptItems = data.transcript;
        }
      } catch (proxyError: any) {
        console.error(`Vercel proxy fetch failed for ${youtubeId}:`, proxyError.message);
      }
    }

    return this.formatTranscriptItems(transcriptItems || []);
  }

  async findAll() {
    return this.prisma.video.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    let video = await this.prisma.video.findUnique({
      where: { id },
      include: { subtitles: { orderBy: { startTime: 'asc' } } },
    });
    if (!video) throw new NotFoundException('Video not found');

    // Auto-heal: if video has 0 subtitles in DB, fetch them on the fly and persist!
    if (!video.subtitles || video.subtitles.length === 0) {
      const fetchedSubs = await this.fetchSubtitlesForYoutubeId(video.youtubeId);
      if (fetchedSubs.length > 0) {
        await this.prisma.subtitle.createMany({
          data: fetchedSubs.map((s) => ({
            videoId: video!.id,
            startTime: s.startTime,
            endTime: s.endTime,
            text: s.text,
          })),
        });
        video = await this.prisma.video.findUnique({
          where: { id },
          include: { subtitles: { orderBy: { startTime: 'asc' } } },
        });
      }
    }

    return video;
  }

  async createFromYoutube(youtubeId: string, title: string, level?: string, author?: string, playlistId?: string, playlistName?: string) {
    const existingVideo = await this.prisma.video.findUnique({
      where: { youtubeId },
      include: { subtitles: { orderBy: { startTime: 'asc' } } },
    });

    if (existingVideo) {
      // Update metadata if missing
      if ((author && !existingVideo.author) || (playlistId && !existingVideo.playlistId)) {
        await this.prisma.video.update({
          where: { id: existingVideo.id },
          data: {
            author: author || existingVideo.author,
            playlistId: playlistId || existingVideo.playlistId,
            playlistName: playlistName || existingVideo.playlistName,
          },
        });
      }

      // If existing video had 0 subtitles due to a previous error, re-fetch and save them now!
      if (!existingVideo.subtitles || existingVideo.subtitles.length === 0) {
        const fetchedSubs = await this.fetchSubtitlesForYoutubeId(youtubeId);
        if (fetchedSubs.length > 0) {
          await this.prisma.subtitle.createMany({
            data: fetchedSubs.map((s) => ({
              videoId: existingVideo.id,
              startTime: s.startTime,
              endTime: s.endTime,
              text: s.text,
            })),
          });
        }
      }

      return this.findOne(existingVideo.id);
    }

    const formattedSubtitles = await this.fetchSubtitlesForYoutubeId(youtubeId);

    return this.prisma.video.create({
      data: {
        youtubeId,
        title,
        level: level || 'Intermediate',
        thumbnail: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
        author,
        playlistId,
        playlistName,
        subtitles: {
          create: formattedSubtitles,
        },
      },
      include: { subtitles: { orderBy: { startTime: 'asc' } } },
    });
  }

  async remove(id: number) {
    return this.prisma.video.delete({
      where: { id },
    });
  }

  async updateSubtitleTranslation(id: number, translation: string) {
    return this.prisma.subtitle.update({
      where: { id },
      data: { translation }
    }).catch(() => null);
  }
}
