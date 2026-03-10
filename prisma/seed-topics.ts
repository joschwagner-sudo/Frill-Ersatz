import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const topics = [
  { name: "Daten Import", emoji: "⚙️", order: 1 },
  { name: "Neues Feature", emoji: "⭐", order: 2 },
  { name: "Verbesserung", emoji: "👌", order: 3 },
  { name: "App", emoji: "📱", order: 4 },
];

async function main() {
  console.log("Seeding topics...");

  for (const topic of topics) {
    const existing = await prisma.topic.findFirst({
      where: { name: topic.name },
    });

    if (existing) {
      console.log(`✓ Topic "${topic.name}" already exists`);
      continue;
    }

    await prisma.topic.create({
      data: topic,
    });

    console.log(`✓ Created topic: ${topic.emoji} ${topic.name}`);
  }

  console.log("\nAll topics seeded!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
