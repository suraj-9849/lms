/* eslint-disable */
// Singleton Prisma: preventing from the hotReloading:Best practice for instantiating Prisma Client (warn(prisma-client) There are already 10 instances of Prisma Client actively running.)
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;
/* eslint-enable */