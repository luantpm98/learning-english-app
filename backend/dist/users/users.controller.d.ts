import { PrismaService } from '../prisma/prisma.service.js';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(id: number): Promise<{
        recentWords: {
            id: number;
            translation: string | null;
            word: string;
            definition: string;
            phonetic: string | null;
            audioUrl: string | null;
            imageUrl: string | null;
            setId: number | null;
        }[];
        reviewWords: {
            id: number;
            translation: string | null;
            word: string;
            definition: string;
            phonetic: string | null;
            audioUrl: string | null;
            imageUrl: string | null;
            setId: number | null;
        }[];
        phrases: {
            id: number;
            startTime: number | null;
            videoId: number | null;
            endTime: number | null;
            text: string;
            translation: string | null;
            createdAt: Date;
            userId: number;
        }[];
        streak: number;
        recentVideo: {
            id: number;
            thumbnail: string | null;
            youtubeId: string;
            title: string;
            level: string | null;
            duration: string | null;
            author: string | null;
            channelId: number | null;
            playlistId: string | null;
            playlistName: string | null;
        } | null;
    }>;
    getVideoProgress(id: number, videoId: number): Promise<{
        id: number;
        videoId: number;
        userId: number;
        progressPercent: number | null;
        lastWatchedAt: Date;
    } | null>;
    updateVideoProgress(id: number, videoId: number, progressTime?: number): Promise<{
        id: number;
        videoId: number;
        userId: number;
        progressPercent: number | null;
        lastWatchedAt: Date;
    }>;
}
