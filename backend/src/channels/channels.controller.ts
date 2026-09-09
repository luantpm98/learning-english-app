import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ChannelsService } from './channels.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách kênh đã subscribe' })
  findAll(@Query('userId') userId?: string) {
    return this.channelsService.findAll(userId ? Number(userId) : undefined);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe kênh YouTube' })
  subscribe(@Body() body: { userId: number; youtubeChannelId: string; name: string; thumbnail?: string; subCount?: string }) {
    return this.channelsService.subscribe(body);
  }

  @Delete(':id/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe kênh YouTube' })
  unsubscribe(@Param('id', ParseIntPipe) id: number, @Query('userId', ParseIntPipe) userId: number) {
    return this.channelsService.unsubscribe(id, userId);
  }
}
