import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class VocabularySetsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vocabularySet.findMany({
      include: {
        _count: {
          select: { words: true }
        }
      }
    });
  }

  async findOne(id: number) {
    const set = await this.prisma.vocabularySet.findUnique({
      where: { id },
      include: { words: true }
    });
    if (!set) throw new NotFoundException('Vocabulary set not found');
    return set;
  }
}
