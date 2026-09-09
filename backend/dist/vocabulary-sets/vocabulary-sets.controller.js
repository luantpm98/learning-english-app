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
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { VocabularySetsService } from './vocabulary-sets.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
let VocabularySetsController = class VocabularySetsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Lấy danh sách bộ từ vựng' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VocabularySetsController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Lấy chi tiết một bộ từ vựng và các từ bên trong' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VocabularySetsController.prototype, "findOne", null);
VocabularySetsController = __decorate([
    ApiTags('VocabularySets'),
    Controller('vocabulary-sets'),
    __metadata("design:paramtypes", [VocabularySetsService])
], VocabularySetsController);
export { VocabularySetsController };
//# sourceMappingURL=vocabulary-sets.controller.js.map