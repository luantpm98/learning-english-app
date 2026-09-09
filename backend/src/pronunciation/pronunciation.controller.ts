import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PronunciationService } from './pronunciation.service.js';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Pronunciation')
@Controller('pronunciation')
export class PronunciationController {
  constructor(private readonly pronService: PronunciationService) {}

  @Post('assess')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        videoId: { type: 'number' },
        subtitleId: { type: 'number' },
        referenceText: { type: 'string' },
        audio: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async assess(
    @UploadedFile() file: any,
    @Body('userId', ParseIntPipe) userId: number,
    @Body('videoId', ParseIntPipe) videoId: number,
    @Body('subtitleId', ParseIntPipe) subtitleId: number,
    @Body('referenceText') referenceText: string,
  ) {
    return this.pronService.assessPronunciation(
      userId,
      videoId,
      subtitleId,
      file.buffer,
      referenceText,
    );
  }
}
