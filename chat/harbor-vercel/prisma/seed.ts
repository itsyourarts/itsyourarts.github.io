import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!username || !password) {
    throw new Error("Set ADMIN_USERNAME and ADMIN_PASSWORD before seeding.");
  }
  if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username)) {
    throw new Error("ADMIN_USERNAME must be 3–40 characters: letters, numbers, dot, underscore, hyphen.");
  }
  if (password.length < 10 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("ADMIN_PASSWORD must be at least 10 characters and include upper, lower, and a number.");
  }
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_ADMIN_SEED !== "true") {
    throw new Error("Set ALLOW_ADMIN_SEED=true to seed an admin in production.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  console.log(`Admin ready: ${username}`);
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : "Seed failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
