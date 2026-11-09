import { PrismaService } from '../prisma/prisma.service.js';
export declare class ChannelsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId?: number): Promise<{
        id: number;
        name: string;
        thumbnail: string | null;
        youtubeChannelId: string;
        subCount: string | null;
    }[]>;
    subscribe(data: {
        userId: number;
        youtubeChannelId: string;
        name: string;
        thumbnail?: string;
        subCount?: string;
    }): Promise<{
        id: number;
        name: string;
        thumbnail: string | null;
        youtubeChannelId: string;
        subCount: string | null;
    }>;
    unsubscribe(id: number, userId: number): Promise<{
        success: boolean;
    }>;
}
