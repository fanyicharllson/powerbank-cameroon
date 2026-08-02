import { prisma } from "../lib/prisma";

async function main() {
  const powerbanks = await prisma.category.upsert({
    where: { name: "Power Banks" },
    update: {},
    create: { name: "Power Banks" },
  });

  const cables = await prisma.category.upsert({
    where: { name: "Cables" },
    update: {},
    create: { name: "Cables" },
  });

  await prisma.product.createMany({
    data: [
      { name: "PB Mini 10K", price: 12000, categoryId: powerbanks.id },
      { name: "PB Pro 20K", price: 25000, categoryId: powerbanks.id },
      { name: "PB Ultra 30K", price: 35000, categoryId: powerbanks.id },
      { name: "USB-C Fast Charge Cable", price: 3500, categoryId: cables.id },
    ],
  });
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
