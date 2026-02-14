import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
const nickname = process.env.INITIAL_ADMIN_NICKNAME?.trim();
const password = process.env.INITIAL_ADMIN_PASSWORD?.trim();
const prisma = new PrismaClient();

async function main() {
  if (!nickname || !password) {
    console.log("INITIAL_ADMIN_NICKNAME and INITIAL_ADMIN_PASSWORD must be set to create admin. Skipping.");
    return;
  }
  const existing = await prisma.user.findUnique({
    where: { nickname },
  });
  if (existing) {
    console.log("Admin already exists.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      nickname,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
