import { PrismaService } from '../prisma/prisma.service.js';
export declare class PronunciationService {
    private prisma;
    constructor(prisma: PrismaService);
    assessPronunciation(userId: number, videoId: number, subtitleId: number, fileBuffer: Buffer, referenceText: string): Promise<{
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
