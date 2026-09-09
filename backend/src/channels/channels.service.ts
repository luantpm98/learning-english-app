import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: number) {
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { channels: true }
      });
      return user?.channels || [];
    }
    return this.prisma.channel.findMany();
  }

  async subscribe(data: { userId: number; youtubeChannelId: string; name: string; thumbnail?: string; subCount?: string }) {
    const channel = await this.prisma.channel.upsert({
      where: { youtubeChannelId: data.youtubeChannelId },
      update: { name: data.name, thumbnail: data.thumbnail, subCount: data.subCount },
      create: { 
        youtubeChannelId: data.youtubeChannelId, 
        name: data.name, 
        thumbnail: data.thumbnail, 
        subCount: data.subCount 
      },
    });
    
    await this.prisma.user.update({
      where: { id: data.userId },
      data: { channels: { connect: { id: channel.id } } },
    });

    return channel;
  }

  async unsubscribe(id: number, userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { channels: { disconnect: { id } } },
    });
    return { success: true };
  }
}
