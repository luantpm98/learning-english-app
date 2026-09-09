import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { VocabularySetsService } from './vocabulary-sets.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('VocabularySets')
@Controller('vocabulary-sets')
export class VocabularySetsController {
  constructor(private readonly service: VocabularySetsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bộ từ vựng' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một bộ từ vựng và các từ bên trong' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
