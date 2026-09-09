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
import { Controller, Post, UseInterceptors, UploadedFile, Body, ParseIntPipe, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PronunciationService } from './pronunciation.service.js';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
let PronunciationController = class PronunciationController {
    pronService;
    constructor(pronService) {
        this.pronService = pronService;
    }
    async assess(file, userId, videoId, subtitleId, referenceText) {
        return this.pronService.assessPronunciation(userId, videoId, subtitleId, file.buffer, referenceText);
    }
};
__decorate([
    Post('assess'),
    UseInterceptors(FileInterceptor('audio')),
    ApiConsumes('multipart/form-data'),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'number' },
                videoId: { type: 'number' },
                subtitleId: { type: 'number' },
                referenceText: { type: 'string' },
                audio: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, UploadedFile()),
    __param(1, Body('userId', ParseIntPipe)),
    __param(2, Body('videoId', ParseIntPipe)),
    __param(3, Body('subtitleId', ParseIntPipe)),
    __param(4, Body('referenceText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], PronunciationController.prototype, "assess", null);
PronunciationController = __decorate([
    ApiTags('Pronunciation'),
    Controller('pronunciation'),
    __metadata("design:paramtypes", [PronunciationService])
], PronunciationController);
export { PronunciationController };
//# sourceMappingURL=pronunciation.controller.js.map