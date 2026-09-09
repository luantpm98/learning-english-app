import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { VideosModule } from './videos/videos.module.js';
import { PronunciationModule } from './pronunciation/pronunciation.module.js';
import { VocabulariesModule } from './vocabularies/vocabularies.module.js';
import { VocabularySetsModule } from './vocabulary-sets/vocabulary-sets.module.js';
import { ChannelsModule } from './channels/channels.module.js';
import { PhrasesModule } from './phrases/phrases.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    PrismaModule, 
    VideosModule, 
    PronunciationModule, 
    VocabulariesModule,
    VocabularySetsModule,
    ChannelsModule,
    PhrasesModule,
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
