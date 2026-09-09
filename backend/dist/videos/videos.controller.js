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
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query, Delete } from '@nestjs/common';
import { VideosService } from './videos.service.js';
import axios from 'axios';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
class CreateVideoDto {
    youtubeId;
    title;
    level;
}
let VideosController = class VideosController {
    videosService;
    constructor(videosService) {
        this.videosService = videosService;
    }
    search(query) {
        return this.videosService.searchYoutube(query);
    }
    searchChannel(query) {
        return this.videosService.searchChannel(query);
    }
    getChannelVideos(query) {
        return this.videosService.getChannelVideos(query);
    }
    getPlaylistVideos(playlistId) {
        return this.videosService.getPlaylistVideos(playlistId);
    }
    findAll() {
        return this.videosService.findAll();
    }
    findOne(id) {
        return this.videosService.findOne(id);
    }
    create(createVideoDto) {
        return this.videosService.createFromYoutube(createVideoDto.youtubeId, createVideoDto.title, createVideoDto.level, createVideoDto.author, createVideoDto.playlistId, createVideoDto.playlistName);
    }
    async translateText(text) {
        try {
            const encodedText = encodeURIComponent(text);
            const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi`;
            const res = await axios.post(url, `q=${encodedText}`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const translated = Array.isArray(res.data) ? res.data.join('') : res.data;
            return { text: translated };
        }
        catch (e) {
            return { text: "Lỗi dịch thuật" };
        }
    }
    async updateSubtitles(id, subtitles) {
        for (const sub of subtitles) {
            if (sub.id && sub.translation) {
                await this.videosService.updateSubtitleTranslation(sub.id, sub.translation);
            }
        }
        return { success: true };
    }
    remove(id) {
        return this.videosService.remove(id);
    }
};
__decorate([
    Get('search'),
    ApiOperation({ summary: 'Search YouTube videos' }),
    ApiQuery({ name: 'q', required: true, description: 'Search keyword' }),
    __param(0, Query('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "search", null);
__decorate([
    Get('search-channel'),
    ApiOperation({ summary: 'Search YouTube channels' }),
    ApiQuery({ name: 'q', required: true, description: 'Search keyword' }),
    __param(0, Query('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "searchChannel", null);
__decorate([
    Get('channel-videos'),
    ApiOperation({ summary: 'Get videos and playlists from a channel' }),
    ApiQuery({ name: 'q', required: true, description: 'Channel ID or URL' }),
    __param(0, Query('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "getChannelVideos", null);
__decorate([
    Get('playlist-videos'),
    ApiOperation({ summary: 'Get videos from a playlist' }),
    ApiQuery({ name: 'playlistId', required: true }),
    __param(0, Query('playlistId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "getPlaylistVideos", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'Get all videos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get a video with subtitles by ID' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "findOne", null);
__decorate([
    Post(),
    ApiOperation({ summary: 'Add a video from YouTube and auto-fetch subtitles' }),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                youtubeId: { type: 'string', example: 'dQw4w9WgXcQ' },
                title: { type: 'string', example: 'Rick Astley' },
                level: { type: 'string', example: 'Beginner' },
            },
        },
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "create", null);
__decorate([
    Post('translate'),
    __param(0, Body('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "translateText", null);
__decorate([
    Put(':id/subtitles'),
    ApiOperation({ summary: 'Update subtitles with translations' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body('subtitles')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "updateSubtitles", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Delete a video' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "remove", null);
VideosController = __decorate([
    ApiTags('Videos'),
    Controller('videos'),
    __metadata("design:paramtypes", [VideosService])
], VideosController);
export { VideosController };
//# sourceMappingURL=videos.controller.js.map