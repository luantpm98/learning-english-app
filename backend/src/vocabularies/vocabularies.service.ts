import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class VocabulariesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vocabulary.findMany();
  }

  async create(data: { word: string; definition: string; phonetic?: string; audioUrl?: string; imageUrl?: string }) {
    return this.prisma.vocabulary.create({ data });
  }

  async remove(id: number) {
    return this.prisma.vocabulary.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Vocabulary not found');
    });
  }

  async update(id: number, data: any) {
    return this.prisma.vocabulary.update({ where: { id }, data });
  }
}
