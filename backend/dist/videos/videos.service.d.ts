import { PrismaService } from '../prisma/prisma.service.js';
export declare class VideosService {
    private prisma;
    private yt;
    constructor(prisma: PrismaService);
    initYT(): Promise<void>;
    searchYoutube(query: string): Promise<{
        youtubeId: any;
        title: any;
        thumbnail: string | undefined;
        duration: any;
        author: any;
    }[]>;
    searchChannel(query: string): Promise<{
        channelId: any;
        name: any;
        thumbnail: string | undefined;
        subCount: any;
    }[]>;
    getChannelVideos(channelIdOrUrl: string): Promise<{
        playlists: any[];
        latestVideos: any[];
    }>;
    getPlaylistVideos(playlistId: string): Promise<{
        youtubeId: any;
        title: any;
        thumbnail: string | undefined;
        duration: any;
        author: any;
    }[]>;
    findAll(): Promise<{
        id: number;
        youtubeId: string;
        title: string;
        level: string | null;
        thumbnail: string | null;
        duration: string | null;
        author: string | null;
        channelId: number | null;
        playlistId: string | null;
        playlistName: string | null;
    }[]>;
    findOne(id: number): Promise<{
        subtitles: {
            id: number;
            startTime: number;
            endTime: number;
            text: string;
            translation: string | null;
            videoId: number;
        }[];
    } & {
        id: number;
        youtubeId: string;
        title: string;
        level: string | null;
        thumbnail: string | null;
        duration: string | null;
        author: string | null;
        channelId: number | null;
        playlistId: string | null;
        playlistName: string | null;
    }>;
    createFromYoutube(youtubeId: string, title: string, level?: string, author?: string, playlistId?: string, playlistName?: string): Promise<{
        id: number;
        youtubeId: string;
        title: string;
        level: string | null;
        thumbnail: string | null;
        duration: string | null;
        author: string | null;
        channelId: number | null;
        playlistId: string | null;
        playlistName: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        youtubeId: string;
        title: string;
        level: string | null;
        thumbnail: string | null;
        duration: string | null;
        author: string | null;
        channelId: number | null;
        playlistId: string | null;
        playlistName: string | null;
    }>;
    updateSubtitleTranslation(id: number, translation: string): Promise<{
        id: number;
        startTime: number;
        endTime: number;
        text: string;
        translation: string | null;
        videoId: number;
    } | null>;
}
