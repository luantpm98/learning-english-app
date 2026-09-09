import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PhrasesService } from './phrases.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Phrases')
@Controller('phrases')
export class PhrasesController {
  constructor(private readonly service: PhrasesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả mẫu câu đã lưu' })
  findAll(@Query('userId') userId?: string) {
    return this.service.findAll(userId ? Number(userId) : undefined);
  }

  @Post()
  @ApiOperation({ summary: 'Lưu mẫu câu từ subtitle' })
  create(@Body() body: { videoId: number; text: string; translation?: string; startTime: number; endTime: number }) {
    return this.service.create(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá mẫu câu' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
