import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const DEFAULT_TRANSACTION_TIMEOUT_MS = 30_000;
const DEFAULT_TRANSACTION_MAX_WAIT_MS = 10_000;

type TransactionOptions = {
  retries?: number;
  delay?: number;
  timeout?: number;
  maxWait?: number;
};

export async function runTransactionWithRetry<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const retries = options.retries ?? 5;
  const delay = options.delay ?? 150;
  const timeout = options.timeout ?? DEFAULT_TRANSACTION_TIMEOUT_MS;
  const maxWait = options.maxWait ?? DEFAULT_TRANSACTION_MAX_WAIT_MS;

  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await prisma.$transaction(fn, { maxWait, timeout });
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
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}
