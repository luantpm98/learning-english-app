import { PrismaService } from '../prisma/prisma.service.js';
export declare class PhrasesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId?: number): Promise<({
        video: {
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
    } & {
        id: number;
        startTime: number | null;
        videoId: number | null;
        endTime: number | null;
        text: string;
        translation: string | null;
        createdAt: Date;
        userId: number;
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
        videoId: number | null;
        endTime: number | null;
        text: string;
        translation: string | null;
        createdAt: Date;
        userId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        startTime: number | null;
        videoId: number | null;
        endTime: number | null;
        text: string;
        translation: string | null;
        createdAt: Date;
        userId: number;
    }>;
}
