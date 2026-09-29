const { PrismaClient } = require('@prisma/client');

// Create a single Prisma instance optimized for session-mode databases
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Graceful shutdown handlers to properly close connections
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
