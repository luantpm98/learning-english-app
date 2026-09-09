import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get(':id/dashboard')
  async getDashboard(@Param('id', ParseIntPipe) id: number) {
    // 1. Top 5 recently learned words (mock by taking latest from vocabulary)
    // In a real app we'd join with WordReview
    const recentWords = await this.prisma.vocabulary.findMany({
      take: 5,
      orderBy: { id: 'desc' } // Mocking recent
    });

    // 2. 5 words to review today (mock)
    const reviewWords = await this.prisma.vocabulary.findMany({
      take: 5,
      skip: 5,
      orderBy: { id: 'desc' }
    });

    // 3. 5 reflex phrases
    const phrases = await this.prisma.phrase.findMany({
      where: { userId: id },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 4. Streak
    const activities = await this.prisma.studyActivity.findMany({
      where: { userId: id },
      orderBy: { date: 'desc' }
    });
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    for (const act of activities) {
      const actDate = new Date(act.date);
      actDate.setHours(0,0,0,0);
      const diffTime = Math.abs(currentDate.getTime() - actDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays <= 1) {
        streak++;
        currentDate = actDate;
      } else {
        break;
      }
    }

    // 5. Recent video
    const progress = await this.prisma.userProgress.findFirst({
      where: { userId: id },
      orderBy: { lastWatchedAt: 'desc' },
      include: { video: true }
    });

    return {
      recentWords,
      reviewWords,
      phrases,
      streak,
      recentVideo: progress?.video || null
    };
  }

  @Get(':id/progress/video/:videoId')
  async getVideoProgress(
    @Param('id', ParseIntPipe) id: number,
    @Param('videoId', ParseIntPipe) videoId: number
  ) {
    return this.prisma.userProgress.findUnique({
      where: { userId_videoId: { userId: id, videoId: videoId } }
    });
  }

  @Post(':id/progress/video/:videoId')
  async updateVideoProgress(
    @Param('id', ParseIntPipe) id: number,
    @Param('videoId', ParseIntPipe) videoId: number,
    @Body('progressTime') progressTime?: number
  ) {
    return this.prisma.userProgress.upsert({
      where: { userId_videoId: { userId: id, videoId: videoId } },
      update: { lastWatchedAt: new Date(), progressPercent: progressTime },
      create: { userId: id, videoId: videoId, progressPercent: progressTime }
    });
  }
}
