import { Module } from '@nestjs/common';
import { VocabularySetsService } from './vocabulary-sets.service.js';
import { VocabularySetsController } from './vocabulary-sets.controller.js';

@Module({
  controllers: [VocabularySetsController],
  providers: [VocabularySetsService],
})
export class VocabularySetsModule {}
