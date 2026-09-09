import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { YoutubeTranscript } from 'youtube-transcript';
// @ts-ignore
import ytSearch from 'yt-search';
import { Innertube } from 'youtubei.js';

const fixUrl = (url?: string) => url?.startsWith("//") ? "https:" + url : url;

@Injectable()
export class VideosService {
  private yt: Innertube;

  constructor(private prisma: PrismaService) {
    this.initYT();
  }

  async initYT() {
    this.yt = await Innertube.create();
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

  async findAll() {
    return this.prisma.video.findMany();
  }

  async findOne(id: number) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: { subtitles: true },
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async createFromYoutube(youtubeId: string, title: string, level?: string, author?: string, playlistId?: string, playlistName?: string) {
    const existingVideo = await this.prisma.video.findUnique({
      where: { youtubeId }
    });
    if (existingVideo) {
      if ((author && !existingVideo.author) || (playlistId && !existingVideo.playlistId)) {
        return this.prisma.video.update({
          where: { id: existingVideo.id },
          data: {
            author: author || existingVideo.author,
            playlistId: playlistId || existingVideo.playlistId,
            playlistName: playlistName || existingVideo.playlistName,
          }
        });
      }
      return existingVideo;
    }

    let transcriptItems: any[] = [];
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeId);
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
    }

    return this.prisma.video.create({
      data: {
        youtubeId,
        title,
        level,
        author,
        playlistId,
        playlistName,
        subtitles: {
          create: transcriptItems.map((item: any, index: number, arr: any[]) => {
            const startTime = item.offset / 1000;
            const rawEndTime = (item.offset + item.duration) / 1000;
            const nextStartTime = index < arr.length - 1 ? arr[index + 1].offset / 1000 : rawEndTime;
            
            let actualEndTime = Math.min(rawEndTime, nextStartTime);
            if (actualEndTime < startTime) actualEndTime = startTime + 0.1;
            
            return {
              startTime,
              endTime: actualEndTime,
              text: item.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim().replace(/\n/g, ' '),
            };
          }),
        },
      },
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


