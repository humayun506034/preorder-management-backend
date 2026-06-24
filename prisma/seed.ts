/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

type SeedPreorder = {
  name: string;
  products: number;
  preorderWhen: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
};

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) return;

  const envFile = readFileSync(envPath, 'utf8');

  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

    if (!match || process.env[match[1]] !== undefined) continue;

    const value = match[2] ?? '';
    process.env[match[1]] = value.replace(/^['"]|['"]$/g, '');
  }
}

function readSeedData(): SeedPreorder[] {
  const filePath = resolve(process.cwd(), 'prisma/seed-data/preorders.json');
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

async function main() {
  loadEnvFile();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing in .env');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const preorders = readSeedData();

  await prisma.preorder.createMany({
    data: preorders.map((p) => ({
      name: p.name,
      products: p.products,
      preorderWhen: p.preorderWhen,
      startsAt: new Date(p.startsAt),
      endsAt: p.endsAt ? new Date(p.endsAt) : null,
      isActive: p.isActive,
    })),
  });

  await prisma.$disconnect();

  console.log(`Seed complete. ${preorders.length} preorders inserted.`);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});