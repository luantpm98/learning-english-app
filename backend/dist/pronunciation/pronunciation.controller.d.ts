import { PronunciationService } from './pronunciation.service.js';
export declare class PronunciationController {
    private readonly pronService;
    constructor(pronService: PronunciationService);
    assess(file: any, userId: number, videoId: number, subtitleId: number, referenceText: string): Promise<{
        id: number;
        s3Url: string;
        score: number;
        feedback: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: number;
        videoId: number;
        subtitleId: number;
    }>;
}
