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
import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ChannelsService } from './channels.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
let ChannelsController = class ChannelsController {
    channelsService;
    constructor(channelsService) {
        this.channelsService = channelsService;
    }
    findAll(userId) {
        return this.channelsService.findAll(userId ? Number(userId) : undefined);
    }
    subscribe(body) {
        return this.channelsService.subscribe(body);
    }
    unsubscribe(id, userId) {
        return this.channelsService.unsubscribe(id, userId);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Lấy danh sách kênh đã subscribe' }),
    __param(0, Query('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "findAll", null);
__decorate([
    Post('subscribe'),
    ApiOperation({ summary: 'Subscribe kênh YouTube' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "subscribe", null);
__decorate([
    Delete(':id/unsubscribe'),
    ApiOperation({ summary: 'Unsubscribe kênh YouTube' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Query('userId', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "unsubscribe", null);
ChannelsController = __decorate([
    ApiTags('Channels'),
    Controller('channels'),
    __metadata("design:paramtypes", [ChannelsService])
], ChannelsController);
export { ChannelsController };
//# sourceMappingURL=channels.controller.js.map