import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Ensure SQLite URL is always used even if Render has a stale Postgres env var
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL?.startsWith('file:') ? process.env.DATABASE_URL : 'file:./dev.db',
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    await this.ensureSeeded();
  }

  private async ensureSeeded() {
    try {
      const adminExists = await this.user.findUnique({ where: { username: 'admin' } });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await this.user.create({
          data: {
            username: 'admin',
            password: hashedPassword,
            name: 'Administrator (Full Access)',
            role: 'ADMIN',
          },
        });
      }

      const luanExists = await this.user.findUnique({ where: { username: 'luantpm98' } });
      if (!luanExists) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await this.user.create({
          data: {
            username: 'luantpm98',
            password: hashedPassword,
            name: 'Trần Luân (Admin)',
            role: 'ADMIN',
          },
        });
      }

      const setCount = await this.vocabularySet.count();
      if (setCount === 0) {
        const set1000 = await this.vocabularySet.create({
          data: {
            name: 'Oxford 1000',
            description: 'The 1000 most common words in English.',
            thumbnail: 'https://images.unsplash.com/photo-1546410531-b4c6e91f6308?w=400&q=80',
          },
        });

        const set3000 = await this.vocabularySet.create({
          data: {
            name: 'Oxford 3000',
            description: 'Advanced 3000 core words for fluent communication.',
            thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80',
          },
        });

        const wordsFile = path.join(process.cwd(), 'words.txt');
        if (fs.existsSync(wordsFile)) {
          const text = fs.readFileSync(wordsFile, 'utf-8');
          const allWords = text.split('\n').map((w) => w.trim()).filter((w) => w.length > 0);
          const words1000 = allWords.slice(0, 1000);
          const words3000 = allWords.slice(1000, 3000);

          const mapToData = (wordList: string[], setId: number) =>
            wordList.map((word) => ({
              word,
              definition: `Definition of ${word}. A core English vocabulary word.`,
              phonetic: `/${word}/`,
              imageUrl: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=400&q=80',
              setId,
            }));

          const chunkSize = 250;
          for (let i = 0; i < words1000.length; i += chunkSize) {
            await this.vocabulary.createMany({
              data: mapToData(words1000.slice(i, i + chunkSize), set1000.id),
            });
          }
          for (let i = 0; i < words3000.length; i += chunkSize) {
            await this.vocabulary.createMany({
              data: mapToData(words3000.slice(i, i + chunkSize), set3000.id),
            });
          }
        }
      }
    } catch (e: any) {
      console.warn('Auto-seed check warning:', e.message);
    }
  }
}
