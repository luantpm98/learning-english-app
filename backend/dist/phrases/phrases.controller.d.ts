import { PhrasesService } from './phrases.service.js';
export declare class PhrasesController {
    private readonly service;
    constructor(service: PhrasesService);
    findAll(userId?: string): Promise<({
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
    create(body: {
        videoId: number;
        text: string;
        translation?: string;
        startTime: number;
        endTime: number;
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
