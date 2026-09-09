import { VideosService } from './videos.service.js';
export declare class VideosController {
    private readonly videosService;
    constructor(videosService: VideosService);
    search(query: string): Promise<{
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
    getChannelVideos(query: string): Promise<{
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
    create(createVideoDto: any): Promise<{
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
    translateText(text: string): Promise<{
        text: any;
    }>;
    updateSubtitles(id: number, subtitles: any[]): Promise<{
        success: boolean;
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
}
