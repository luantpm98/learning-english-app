var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { YoutubeTranscript } from 'youtube-transcript';
import { Innertube } from 'youtubei.js';
import https from 'https';
import axios from 'axios';
const fixUrl = (url) => url?.startsWith("//") ? "https:" + url : url;
let VideosService = class VideosService {
    prisma;
    yt;
    constructor(prisma) {
        this.prisma = prisma;
        this.initYT();
    }
    async initYT() {
        try {
            this.yt = await Innertube.create();
        }
        catch (e) {
            console.warn('Innertube init warning:', e.message);
        }
    }
    async searchYoutube(query) {
        if (!this.yt)
            await this.initYT();
        const result = await this.yt.search(query, { type: 'video' });
        return result.videos.map((v) => ({
            youtubeId: v.id,
            title: v.title.text,
            thumbnail: fixUrl(v.thumbnails?.[0]?.url),
            duration: v.duration?.text,
            author: v.author?.name
        }));
    }
    async searchChannel(query) {
        if (!this.yt)
            await this.initYT();
        const result = await this.yt.search(query, { type: 'channel' });
        return result.channels.map((c) => ({
            channelId: c.id,
            name: c.author?.name,
            thumbnail: fixUrl(c.author?.thumbnails?.[0]?.url || c.thumbnails?.[0]?.url),
            subCount: c.video_count?.text || c.subscribers?.text || c.subscriber_count?.text || ''
        }));
    }
    async getChannelVideos(channelIdOrUrl) {
        try {
            if (!this.yt)
                await this.initYT();
            let query = channelIdOrUrl;
            if (query.includes('/c/') || query.includes('/channel/') || query.includes('/@')) {
                query = query.split('/').pop() || query;
            }
            let channel;
            if (query.startsWith('UC') && query.length === 24) {
                channel = await this.yt.getChannel(query);
            }
            else {
                const search = await this.yt.search(query, { type: 'channel' });
                const firstChannel = search.channels[0];
                if (!firstChannel)
                    throw new Error("Channel not found");
                channel = await this.yt.getChannel(firstChannel.id);
            }
            let playlists = [];
            try {
                const playlistsData = await channel.getPlaylists();
                playlists = (playlistsData.playlists || []).map((p) => ({
                    id: p.id || p.content_id || p.playlistId,
                    title: p.title?.text || p.title?.toString() || p.metadata?.title?.text || p.title || '',
                    thumbnail: fixUrl(p.thumbnails?.[0]?.url || p.content_image?.primary_thumbnail?.image?.[0]?.url || p.thumbnail?.thumbnails?.[0]?.url || p.image?.sources?.[0]?.url),
                    videoCount: p.video_count?.text || p.videoCount || p.content_image?.primary_thumbnail?.overlays?.[0]?.badges?.[0]?.text || ''
                }));
            }
            catch (e) {
                console.log("No playlists tab found or error:", e.message);
            }
            let latestVideos = [];
            try {
                const videosData = await channel.getVideos();
                latestVideos = (videosData.videos || []).map((v) => ({
                    youtubeId: v.id || v.content_id || v.videoId,
                    title: v.title?.text || v.title?.toString() || v.title || v.metadata?.title?.text || '',
                    thumbnail: fixUrl(v.thumbnails?.[0]?.url || v.image?.sources?.[0]?.url || v.thumbnail?.thumbnails?.[0]?.url || v.thumbnail?.url || v.content_image?.image?.[0]?.url),
                    duration: v.duration?.text || '',
                    author: channel.metadata?.title || ''
                }));
            }
            catch (e) {
                console.log("No videos tab found or error:", e.message);
            }
            return { playlists, latestVideos };
        }
        catch (e) {
            console.error(e);
            return { playlists: [], latestVideos: [] };
        }
    }
    async getPlaylistVideos(playlistId) {
        if (!this.yt)
            await this.initYT();
        const playlist = await this.yt.getPlaylist(playlistId);
        return playlist.items.map((v) => ({
            youtubeId: v.id || v.content_id || v.videoId,
            title: v.title?.text || v.title?.toString() || v.metadata?.title?.text || v.title || '',
            thumbnail: fixUrl(v.thumbnails?.[0]?.url || v.image?.sources?.[0]?.url || v.thumbnail?.thumbnails?.[0]?.url || v.thumbnail?.url || v.content_image?.image?.[0]?.url),
            duration: v.duration?.text || '',
            author: v.author?.name || ''
        }));
    }
    decodeHtmlEntities(str) {
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
    formatTranscriptItems(transcriptItems) {
        return transcriptItems
            .map((item, index, arr) => {
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
    async fetchSubtitlesForYoutubeId(youtubeId) {
        let transcriptItems = [];
        try {
            transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeId, { lang: 'en' });
        }
        catch {
            try {
                transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeId);
            }
            catch (err) {
                console.log(`Direct YoutubeTranscript failed for ${youtubeId}:`, err.message);
            }
        }
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
                    transcriptItems = res.data.transcript.map((item) => ({
                        text: item.text,
                        duration: parseFloat(item.duration) * 1000,
                        offset: parseFloat(item.offset) * 1000,
                    }));
                }
            }
            catch (rapidErr) {
                console.log(`RapidAPI transcript failed for ${youtubeId}:`, rapidErr.message);
            }
        }
        if (!transcriptItems || transcriptItems.length === 0) {
            try {
                const data = await new Promise((resolve, reject) => {
                    https.get(`https://learning-english-app-henna.vercel.app/api/transcript?videoId=${youtubeId}`, (res) => {
                        let body = '';
                        res.on('data', (chunk) => (body += chunk));
                        res.on('end', () => {
                            try {
                                resolve(JSON.parse(body));
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    }).on('error', reject);
                });
                if (data && Array.isArray(data.transcript) && data.transcript.length > 0) {
                    transcriptItems = data.transcript;
                }
            }
            catch (proxyError) {
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
    async findOne(id) {
        let video = await this.prisma.video.findUnique({
            where: { id },
            include: { subtitles: { orderBy: { startTime: 'asc' } } },
        });
        if (!video)
            throw new NotFoundException('Video not found');
        if (!video.subtitles || video.subtitles.length === 0) {
            const fetchedSubs = await this.fetchSubtitlesForYoutubeId(video.youtubeId);
            if (fetchedSubs.length > 0) {
                await this.prisma.subtitle.createMany({
                    data: fetchedSubs.map((s) => ({
                        videoId: video.id,
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
    async createFromYoutube(youtubeId, title, level, author, playlistId, playlistName) {
        const existingVideo = await this.prisma.video.findUnique({
            where: { youtubeId },
            include: { subtitles: { orderBy: { startTime: 'asc' } } },
        });
        if (existingVideo) {
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
    async remove(id) {
        return this.prisma.video.delete({
            where: { id },
        });
    }
    async updateSubtitleTranslation(id, translation) {
        return this.prisma.subtitle.update({
            where: { id },
            data: { translation }
        }).catch(() => null);
    }
};
VideosService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], VideosService);
export { VideosService };
//# sourceMappingURL=videos.service.js.map