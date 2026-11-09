import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('1. Seeding full-permission Admin accounts...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword, name: 'Administrator (Full Access)', role: 'ADMIN' },
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator (Full Access)',
      role: 'ADMIN',
    },
  });

  const luanUser = await prisma.user.upsert({
    where: { username: 'luantpm98' },
    update: { password: hashedPassword, name: 'Trần Luân (Admin)', role: 'ADMIN' },
    create: {
      username: 'luantpm98',
      password: hashedPassword,
      name: 'Trần Luân (Admin)',
      role: 'ADMIN',
    },
  });

  // Record today's activity for streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const u of [adminUser, luanUser]) {
    await prisma.studyActivity.upsert({
      where: { userId_date: { userId: u.id, date: today } },
      update: {},
      create: { userId: u.id, date: today },
    });
  }

  console.log('2. Seeding Oxford 1000 and 3000 words...');
  await prisma.vocabulary.deleteMany({});
  await prisma.vocabularySet.deleteMany({});

  const set1000 = await prisma.vocabularySet.create({
    data: {
      name: 'Oxford 1000',
      description: 'The 1000 most common words in English.',
      thumbnail: 'https://images.unsplash.com/photo-1546410531-b4c6e91f6308?w=400&q=80',
    },
  });

  const set3000 = await prisma.vocabularySet.create({
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

    // SQLite supports batch insert in chunks
    const chunkSize = 250;
    for (let i = 0; i < words1000.length; i += chunkSize) {
      await prisma.vocabulary.createMany({
        data: mapToData(words1000.slice(i, i + chunkSize), set1000.id),
      });
    }
    for (let i = 0; i < words3000.length; i += chunkSize) {
      await prisma.vocabulary.createMany({
        data: mapToData(words3000.slice(i, i + chunkSize), set3000.id),
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
