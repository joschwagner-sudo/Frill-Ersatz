import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Topics
  const topics = [
    { name: 'Daten Import', emoji: '⚙️', order: 1 },
    { name: 'Neues Feature', emoji: '⭐', order: 2 },
    { name: 'Verbesserung', emoji: '👌', order: 3 },
    { name: 'App', emoji: '📱', order: 4 },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { id: topic.name }, // Use name as unique identifier for upsert
      update: {},
      create: topic,
    });
    console.log(`✅ Topic: ${topic.emoji} ${topic.name}`);
  }

  // Seed Announcement Categories
  const categories = [
    { name: 'Verbesserung', color: '#63C8D9', emoji: '👌' },
    { name: 'New Feature', color: '#6392D9', emoji: '⭐' },
    { name: 'Bugfix', color: '#87eb5e', emoji: '🐛' },
    { name: 'Announcement', color: '#FF3C3C', emoji: '📣' },
  ];

  for (const category of categories) {
    await prisma.announcementCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`✅ Category: ${category.emoji} ${category.name}`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
