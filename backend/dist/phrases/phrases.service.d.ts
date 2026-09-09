import { PrismaService } from '../prisma/prisma.service.js';
export declare class PhrasesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId?: number): Promise<({
        video: {
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
        } | null;
    } & {
        id: number;
        startTime: number | null;
        endTime: number | null;
        text: string;
        translation: string | null;
        createdAt: Date;
        userId: number;
        videoId: number | null;
    })[]>;
    create(data: {
        userId?: number;
        videoId?: number;
        text: string;
        translation?: string;
        startTime?: number;
        endTime?: number;
    }): Promise<{
        id: number;
        startTime: number | null;
        endTime: number | null;
        text: string;
        translation: string | null;
        createdAt: Date;
        userId: number;
        videoId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        startTime: number | null;
        endTime: number | null;
        text: string;
        translation: string | null;
        createdAt: Date;
        userId: number;
        videoId: number | null;
    }>;
}
