import { PrismaService } from '../prisma/prisma.service.js';
export declare class PronunciationService {
    private prisma;
    constructor(prisma: PrismaService);
    assessPronunciation(userId: number, videoId: number, subtitleId: number, fileBuffer: Buffer, referenceText: string): Promise<{
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
