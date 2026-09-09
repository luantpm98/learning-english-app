import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PhrasesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: number) {
    const where = userId ? { userId: Number(userId) } : {};
    return this.prisma.phrase.findMany({
      where,
      include: { video: true }
    });
  }

  async create(data: { userId?: number; videoId?: number; text: string; translation?: string; startTime?: number; endTime?: number }) {
    return this.prisma.phrase.create({
      data: {
        ...data,
        userId: data.userId || 1, // Fallback to 1 if not provided
      }
    });
  }

  async remove(id: number) {
    return this.prisma.phrase.delete({ where: { id } });
  }
}
