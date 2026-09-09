import { Module } from '@nestjs/common';
import { PhrasesService } from './phrases.service.js';
import { PhrasesController } from './phrases.controller.js';

@Module({
  controllers: [PhrasesController],
  providers: [PhrasesService],
})
export class PhrasesModule {}
