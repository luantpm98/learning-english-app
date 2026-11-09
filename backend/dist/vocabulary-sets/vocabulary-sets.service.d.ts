import { PrismaService } from '../prisma/prisma.service.js';
export declare class VocabularySetsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        _count: {
            words: number;
        };
    } & {
        id: number;
        name: string;
        description: string | null;
        thumbnail: string | null;
    })[]>;
    findOne(id: number): Promise<{
        words: {
            id: number;
            translation: string | null;
            word: string;
            definition: string;
            phonetic: string | null;
            audioUrl: string | null;
            imageUrl: string | null;
            setId: number | null;
        }[];
    } & {
        id: number;
        name: string;
        description: string | null;
        thumbnail: string | null;
    }>;
}
