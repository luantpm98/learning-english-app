import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Vocabularies')
@Controller('vocabularies')
export class VocabulariesController {
  constructor(private readonly vocabsService: VocabulariesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách từ vựng' })
  findAll() {
    return this.vocabsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Thêm từ vựng mới' })
  create(@Body() body: { word: string; definition: string; phonetic?: string; audioUrl?: string; imageUrl?: string }) {
    return this.vocabsService.create(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa từ vựng' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vocabsService.remove(id);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Cập nhật từ vựng' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.vocabsService.update(id, body);
  }
}
