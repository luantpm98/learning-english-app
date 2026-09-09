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
import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PhrasesService } from './phrases.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
let PhrasesController = class PhrasesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(userId) {
        return this.service.findAll(userId ? Number(userId) : undefined);
    }
    create(body) {
        return this.service.create(body);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Lấy tất cả mẫu câu đã lưu' }),
    __param(0, Query('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhrasesController.prototype, "findAll", null);
__decorate([
    Post(),
    ApiOperation({ summary: 'Lưu mẫu câu từ subtitle' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PhrasesController.prototype, "create", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Xoá mẫu câu' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PhrasesController.prototype, "remove", null);
PhrasesController = __decorate([
    ApiTags('Phrases'),
    Controller('phrases'),
    __metadata("design:paramtypes", [PhrasesService])
], PhrasesController);
export { PhrasesController };
//# sourceMappingURL=phrases.controller.js.map