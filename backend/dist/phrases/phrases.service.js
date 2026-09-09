var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let PhrasesService = class PhrasesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        const where = userId ? { userId: Number(userId) } : {};
        return this.prisma.phrase.findMany({
            where,
            include: { video: true }
        });
    }
    async create(data) {
        return this.prisma.phrase.create({
            data: {
                ...data,
                userId: data.userId || 1,
            }
        });
    }
    async remove(id) {
        return this.prisma.phrase.delete({ where: { id } });
    }
};
PhrasesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PhrasesService);
export { PhrasesService };
//# sourceMappingURL=phrases.service.js.map