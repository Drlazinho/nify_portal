import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
const nickname = process.env.INITIAL_ADMIN_NICKNAME?.trim();
const password = process.env.INITIAL_ADMIN_PASSWORD?.trim();
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { nickname: nickname },
  });
  if (existing) {
    console.log("Admin drlazinho already exists.");
    return;
  }
  const passwordHash = await bcrypt.hash(password!, 10);
  await prisma.user.create({
    data: {
      nickname: "drlazinho",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin drlazinho created with password 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
