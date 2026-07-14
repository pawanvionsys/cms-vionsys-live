import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function runTransactionWithRetry<T>(
  fn: (tx: any) => Promise<T>,
  retries = 5,
  delay = 150
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await prisma.$transaction(fn);
    } catch (err: any) {
      lastError = err;
      const isWriteConflict =
        err.code === 'P2034' ||
        err.message?.includes('write conflict') ||
        err.message?.includes('deadlock') ||
        err.message?.includes('Transaction failed due to a write conflict');

      if (isWriteConflict && attempt < retries) {
        console.warn(
          `[Prisma Transaction Retry] Write conflict or deadlock detected (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
