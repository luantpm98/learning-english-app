var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(data) {
        const username = String(data?.username || '').trim().toLowerCase();
        const password = String(data?.password || '');
        if (!username || username.length < 3) {
            throw new BadRequestException('Tên tài khoản phải có ít nhất 3 ký tự');
        }
        if (!password || password.length < 4) {
            throw new BadRequestException('Mật khẩu phải có ít nhất 4 ký tự');
        }
        const exists = await this.prisma.user.findUnique({ where: { username } });
        if (exists) {
            throw new ConflictException(`Tài khoản "${username}" đã tồn tại. Vui lòng chọn tên khác!`);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name: String(data?.name || username).trim(),
                role: data?.role === 'ADMIN' ? 'ADMIN' : 'USER',
            },
        });
        return { id: user.id, username: user.username, name: user.name, role: user.role };
    }
    async login(data) {
        const username = String(data?.username || '').trim().toLowerCase();
        const password = String(data?.password || '');
        if (!username || !password) {
            throw new BadRequestException('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
        }
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user) {
            throw new UnauthorizedException('Sai tên tài khoản hoặc mật khẩu');
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new UnauthorizedException('Sai tên tài khoản hoặc mật khẩu');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await this.prisma.studyActivity
            .upsert({
            where: { userId_date: { userId: user.id, date: today } },
            update: {},
            create: { userId: user.id, date: today },
        })
            .catch(() => { });
        return { id: user.id, username: user.username, name: user.name, role: user.role };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map