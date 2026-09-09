import { VocabulariesService } from './vocabularies.service.js';
export declare class VocabulariesController {
    private readonly vocabsService;
    constructor(vocabsService: VocabulariesService);
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
    create(body: {
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
    update(id: number, body: any): Promise<{
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
