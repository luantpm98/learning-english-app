import { PronunciationService } from './pronunciation.service.js';
export declare class PronunciationController {
    private readonly pronService;
    constructor(pronService: PronunciationService);
    assess(file: any, userId: number, videoId: number, subtitleId: number, referenceText: string): Promise<{
        id: number;
        videoId: number;
        s3Url: string;
        score: number;
        feedback: string | null;
        createdAt: Date;
        userId: number;
        subtitleId: number;
    }>;
}
