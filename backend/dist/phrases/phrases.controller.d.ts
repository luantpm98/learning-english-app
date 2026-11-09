import { PhrasesService } from './phrases.service.js';
export declare class PhrasesController {
    private readonly service;
    constructor(service: PhrasesService);
    findAll(userId?: string): Promise<({
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
    create(body: {
        videoId: number;
        text: string;
        translation?: string;
        startTime: number;
        endTime: number;
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
