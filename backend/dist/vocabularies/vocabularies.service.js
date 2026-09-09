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
let VocabulariesService = class VocabulariesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.vocabulary.findMany();
    }
    async create(data) {
        return this.prisma.vocabulary.create({ data });
    }
    async remove(id) {
        return this.prisma.vocabulary.delete({ where: { id } }).catch(() => {
            throw new NotFoundException('Vocabulary not found');
        });
    }
    async update(id, data) {
        return this.prisma.vocabulary.update({ where: { id }, data });
    }
};
VocabulariesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], VocabulariesService);
export { VocabulariesService };
//# sourceMappingURL=vocabularies.service.js.map