import { PrismaService } from '../prisma/prisma.service.js';
export declare class VocabulariesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        translation: string | null;
        word: string;
        definition: string;
        phonetic: string | null;
        audioUrl: string | null;
        imageUrl: string | null;
        setId: number | null;
    }[]>;
    create(data: {
        word: string;
        definition: string;
        phonetic?: string;
        audioUrl?: string;
        imageUrl?: string;
    }): Promise<{
        id: number;
        translation: string | null;
        word: string;
        definition: string;
        phonetic: string | null;
        audioUrl: string | null;
        imageUrl: string | null;
        setId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        translation: string | null;
        word: string;
        definition: string;
        phonetic: string | null;
        audioUrl: string | null;
        imageUrl: string | null;
        setId: number | null;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        translation: string | null;
        word: string;
        definition: string;
        phonetic: string | null;
        audioUrl: string | null;
        imageUrl: string | null;
        setId: number | null;
    }>;
}
