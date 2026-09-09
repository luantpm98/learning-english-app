var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let VocabularySetsService = class VocabularySetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.vocabularySet.findMany({
            include: {
                _count: {
                    select: { words: true }
                }
            }
        });
    }
    async findOne(id) {
        const set = await this.prisma.vocabularySet.findUnique({
            where: { id },
            include: { words: true }
        });
        if (!set)
            throw new NotFoundException('Vocabulary set not found');
        return set;
    }
};
VocabularySetsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], VocabularySetsService);
export { VocabularySetsService };
//# sourceMappingURL=vocabulary-sets.service.js.map