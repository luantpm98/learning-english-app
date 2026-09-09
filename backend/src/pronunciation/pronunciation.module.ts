import { Module } from '@nestjs/common';
import { PronunciationService } from './pronunciation.service.js';
import { PronunciationController } from './pronunciation.controller.js';

@Module({
  controllers: [PronunciationController],
  providers: [PronunciationService],
})
export class PronunciationModule {}
