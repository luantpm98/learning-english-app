import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query, Delete } from '@nestjs/common';
import { VideosService } from './videos.service.js';
import axios from 'axios';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';

class CreateVideoDto {
  youtubeId: string;
  title: string;
  level?: string;
}

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  @Get('test-proxy/:id')
  async testProxy(@Param('id') id: string) {
    const https = require('https');
    return new Promise((resolve, reject) => {
      https.get(`https://learning-english-app-henna.vercel.app/api/transcript?videoId=${id}`, (res: any) => {
        let body = '';
        res.on('data', (chunk: any) => body += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch (e) { resolve({ error: e.message, body }); }
        });
      }).on('error', (e: any) => resolve({ error: e.message }));
    });
  }

  constructor(private readonly videosService: VideosService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search YouTube videos' })
  @ApiQuery({ name: 'q', required: true, description: 'Search keyword' })
  search(@Query('q') query: string) {
    return this.videosService.searchYoutube(query);
  }

  @Get('search-channel')
  @ApiOperation({ summary: 'Search YouTube channels' })
  @ApiQuery({ name: 'q', required: true, description: 'Search keyword' })
  searchChannel(@Query('q') query: string) {
    return this.videosService.searchChannel(query);
  }

  @Get('channel-videos')
  @ApiOperation({ summary: 'Get videos and playlists from a channel' })
  @ApiQuery({ name: 'q', required: true, description: 'Channel ID or URL' })
  getChannelVideos(@Query('q') query: string) {
    return this.videosService.getChannelVideos(query);
  }

  @Get('playlist-videos')
  @ApiOperation({ summary: 'Get videos from a playlist' })
  @ApiQuery({ name: 'playlistId', required: true })
  getPlaylistVideos(@Query('playlistId') playlistId: string) {
    return this.videosService.getPlaylistVideos(playlistId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos' })
  findAll() {
    return this.videosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a video with subtitles by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a video from YouTube and auto-fetch subtitles' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        youtubeId: { type: 'string', example: 'dQw4w9WgXcQ' },
        title: { type: 'string', example: 'Rick Astley' },
        level: { type: 'string', example: 'Beginner' },
      },
    },
  })
  create(@Body() createVideoDto: any) {
    return this.videosService.createFromYoutube(
      createVideoDto.youtubeId,
      createVideoDto.title,
      createVideoDto.level,
      createVideoDto.author,
      createVideoDto.playlistId,
      createVideoDto.playlistName
    );
  }

  @Post('translate')
  async translateText(@Body('text') text: string) {
    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi`;
      const res = await axios.post(url, `q=${encodedText}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const translated = Array.isArray(res.data) ? res.data.join('') : res.data;
      return { text: translated };
    } catch (e) {
      return { text: "Lỗi dịch thuật" };
    }
  }

  @Put(':id/subtitles')
  @ApiOperation({ summary: 'Update subtitles with translations' })
  async updateSubtitles(@Param('id', ParseIntPipe) id: number, @Body('subtitles') subtitles: any[]) {
    // We can update each subtitle translation
    // In a real app we'd use a transaction or upsert, for now just loop
    for (const sub of subtitles) {
      if (sub.id && sub.translation) {
        await this.videosService.updateSubtitleTranslation(sub.id, sub.translation);
      }
    }
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.remove(id);
  }
}

