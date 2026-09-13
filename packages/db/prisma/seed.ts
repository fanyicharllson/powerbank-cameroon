import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/index";

async function main() {
  const powerbanks = await prisma.category.upsert({
    where: { name: "Power Banks" },
    update: {},
    create: { name: "Power Banks" },
  });

  const products = [
    {
      id: "pb-mini-10k",
      name: "PB Mini 10K",
      capacity: "10K mAh",
      capacityMah: 10000,
      chargingSpeed: "Standard Charging",
      features: ["10,000mAh Capacity", "Compact & Light", "USB-C + USB-A"],
      price: 12000,
      badge: "10K",
      image: "/products/pb-mini-10k.jpg",
    },
    {
      id: "pb-pro-20k",
      name: "PB Pro 20K",
      capacity: "20K mAh",
      capacityMah: 20000,
      chargingSpeed: "Fast Charging",
      features: ["20,000mAh Capacity", "Fast Charging", "Dual USB Output"],
      price: 25000,
      badge: "20K",
      image: "/products/pb-pro-20k.jpg",
    },
    {
      id: "pb-ultra-30k",
      name: "PB Ultra 30K",
      capacity: "30K mAh",
      capacityMah: 30000,
      chargingSpeed: "3 Outputs",
      features: ["30,000mAh Capacity", "Triple Outputs", "LED Torch"],
      price: 35000,
      badge: "30K",
      image: "/products/pb-ultra-30k.jpg",
    },
    {
      id: "pb-laptop-65w",
      name: "PB Laptop 65W",
      capacity: "65W Fast",
      capacityMah: 25000,
      chargingSpeed: "65W Fast Charging",
      features: ["65W Fast Charging", "For Laptops & Phones", "Large Capacity"],
      price: 65000,
      badge: "65W",
      image: "/products/pb-laptop-65w.jpg",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { ...product, categoryId: powerbanks.id, isActive: true },
      create: { ...product, categoryId: powerbanks.id },
    });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@powerbankcameroon.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME || "Powerbank Admin";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash },
    create: { email: adminEmail, name: adminName, passwordHash },
  });

  console.log(`Seeded catalog and admin user: ${adminEmail}`);
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
