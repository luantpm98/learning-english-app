import { PronunciationService } from './pronunciation.service.js';
export declare class PronunciationController {
    private readonly pronService;
    constructor(pronService: PronunciationService);
    assess(file: any, userId: number, videoId: number, subtitleId: number, referenceText: string): Promise<{
        feedback: string | null;
        id: number;
        videoId: number;
        s3Url: string;
        score: number;
        createdAt: Date;
        userId: number;
        subtitleId: number;
    }>;
}
