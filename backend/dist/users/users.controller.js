var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let UsersController = class UsersController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(id) {
        const recentWords = await this.prisma.vocabulary.findMany({
            take: 5,
            orderBy: { id: 'desc' }
        });
        const reviewWords = await this.prisma.vocabulary.findMany({
            take: 5,
            skip: 5,
            orderBy: { id: 'desc' }
        });
        const phrases = await this.prisma.phrase.findMany({
            where: { userId: id },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        const activities = await this.prisma.studyActivity.findMany({
            where: { userId: id },
            orderBy: { date: 'desc' }
        });
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        for (const act of activities) {
            const actDate = new Date(act.date);
            actDate.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(currentDate.getTime() - actDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 1) {
                streak++;
                currentDate = actDate;
            }
            else {
                break;
            }
        }
        const progress = await this.prisma.userProgress.findFirst({
            where: { userId: id },
            orderBy: { lastWatchedAt: 'desc' },
            include: { video: true }
        });
        return {
            recentWords,
            reviewWords,
            phrases,
            streak,
            recentVideo: progress?.video || null
        };
    }
    async getVideoProgress(id, videoId) {
        return this.prisma.userProgress.findUnique({
            where: { userId_videoId: { userId: id, videoId: videoId } }
        });
    }
    async updateVideoProgress(id, videoId, progressTime) {
        return this.prisma.userProgress.upsert({
            where: { userId_videoId: { userId: id, videoId: videoId } },
            update: { lastWatchedAt: new Date(), progressPercent: progressTime },
            create: { userId: id, videoId: videoId, progressPercent: progressTime }
        });
    }
};
__decorate([
    Get(':id/dashboard'),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getDashboard", null);
__decorate([
    Get(':id/progress/video/:videoId'),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Param('videoId', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getVideoProgress", null);
__decorate([
    Post(':id/progress/video/:videoId'),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Param('videoId', ParseIntPipe)),
    __param(2, Body('progressTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateVideoProgress", null);
UsersController = __decorate([
    Controller('users'),
    __metadata("design:paramtypes", [PrismaService])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map