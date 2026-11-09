import { VocabularySetsService } from './vocabulary-sets.service.js';
export declare class VocabularySetsController {
    private readonly service;
    constructor(service: VocabularySetsService);
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
