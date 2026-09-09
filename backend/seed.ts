import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Oxford 1000 and 3000 words...');
  
  // Clear old vocabularies
  await prisma.vocabulary.deleteMany({});
  await prisma.vocabularySet.deleteMany({});
  
  // Create Sets
  const set1000 = await prisma.vocabularySet.create({
    data: {
      name: 'Oxford 1000',
      description: 'The 1000 most common words in English.',
      thumbnail: 'https://images.unsplash.com/photo-1546410531-b4c6e91f6308?w=400&q=80'
    }
  });

  const set3000 = await prisma.vocabularySet.create({
    data: {
      name: 'Oxford 3000',
      description: 'Advanced 3000 core words for fluent communication.',
      thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80'
    }
  });

  const text = fs.readFileSync(path.join(process.cwd(), 'words.txt'), 'utf-8');
  const allWords = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
  
  const words1000 = allWords.slice(0, 1000);
  const words3000 = allWords.slice(1000, 3000);

  const mapToData = (wordList: string[], setId: number) => {
    return wordList.map((word) => ({
      word,
      definition: `Definition of ${word}. A very common English word.`,
      phonetic: `/${word}/`,
      imageUrl: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=400&q=80',
      setId
    }));
  };

  console.log('Inserting 1000 words...');
  await prisma.vocabulary.createMany({
    data: mapToData(words1000, set1000.id),
    skipDuplicates: true,
  });

  console.log('Inserting 2000 more words for the 3000 set...');
  await prisma.vocabulary.createMany({
    data: mapToData(words3000, set3000.id),
    skipDuplicates: true,
  });
  
  console.log('Seeding completed!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
