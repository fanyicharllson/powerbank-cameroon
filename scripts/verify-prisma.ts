import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const count = await prisma.product.count();
  console.log(`✅ Connected. Product count: ${count}`);
}

main()
  .catch((e) => {
    console.error("❌ Connection failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
