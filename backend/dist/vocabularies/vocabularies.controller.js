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
import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
let VocabulariesController = class VocabulariesController {
    vocabsService;
    constructor(vocabsService) {
        this.vocabsService = vocabsService;
    }
    findAll() {
        return this.vocabsService.findAll();
    }
    create(body) {
        return this.vocabsService.create(body);
    }
    remove(id) {
        return this.vocabsService.remove(id);
    }
    update(id, body) {
        return this.vocabsService.update(id, body);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Lấy danh sách từ vựng' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VocabulariesController.prototype, "findAll", null);
__decorate([
    Post(),
    ApiOperation({ summary: 'Thêm từ vựng mới' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VocabulariesController.prototype, "create", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Xóa từ vựng' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VocabulariesController.prototype, "remove", null);
__decorate([
    Post(':id'),
    ApiOperation({ summary: 'Cập nhật từ vựng' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VocabulariesController.prototype, "update", null);
VocabulariesController = __decorate([
    ApiTags('Vocabularies'),
    Controller('vocabularies'),
    __metadata("design:paramtypes", [VocabulariesService])
], VocabulariesController);
export { VocabulariesController };
//# sourceMappingURL=vocabularies.controller.js.map