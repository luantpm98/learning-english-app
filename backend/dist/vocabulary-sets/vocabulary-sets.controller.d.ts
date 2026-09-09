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
        thumbnail: string | null;
        name: string;
        description: string | null;
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
        thumbnail: string | null;
        name: string;
        description: string | null;
    }>;
}
