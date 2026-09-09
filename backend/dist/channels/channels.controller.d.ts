import { ChannelsService } from './channels.service.js';
export declare class ChannelsController {
    private readonly channelsService;
    constructor(channelsService: ChannelsService);
    findAll(userId?: string): Promise<{
        id: number;
        thumbnail: string | null;
        name: string;
        youtubeChannelId: string;
        subCount: string | null;
    }[]>;
    subscribe(body: {
        userId: number;
        youtubeChannelId: string;
        name: string;
        thumbnail?: string;
        subCount?: string;
    }): Promise<{
        id: number;
        thumbnail: string | null;
        name: string;
        youtubeChannelId: string;
        subCount: string | null;
    }>;
    unsubscribe(id: number, userId: number): Promise<{
        success: boolean;
    }>;
}
