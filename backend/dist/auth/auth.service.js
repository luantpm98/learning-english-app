var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(data) {
        const exists = await this.prisma.user.findUnique({ where: { username: data.username } });
        if (exists)
            throw new ConflictException('Username already taken');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: data.username,
                password: hashedPassword,
                name: data.username,
            }
        });
        return { id: user.id, username: user.username };
    }
    async login(data) {
        const user = await this.prisma.user.findUnique({ where: { username: data.username } });
        if (!user)
            throw new UnauthorizedException('Invalid credentials');
        const isValid = await bcrypt.compare(data.password, user.password);
        if (!isValid)
            throw new UnauthorizedException('Invalid credentials');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await this.prisma.studyActivity.upsert({
            where: { userId_date: { userId: user.id, date: today } },
            update: {},
            create: { userId: user.id, date: today }
        });
        return { id: user.id, username: user.username };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map