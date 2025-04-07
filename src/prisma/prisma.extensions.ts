import { Prisma } from '@prisma/client';

export const existsExtension = Prisma.defineExtension({
  name: 'exists-extension',
  model: {
    $allModels: {
      async exists<T>(
        this: T,
        where: Prisma.Args<T, 'findFirst'>['where'],
      ): Promise<boolean> {
        const ctx = Prisma.getExtensionContext(this);
        const count = await (ctx as any).count({
          where,
          take: 1,
        } as Prisma.Args<T, 'count'>);
        return count > 0;
      },
    },
  },
});

export const softDeleteExtension = Prisma.defineExtension({
  name: 'soft-delete-extension',
  model: {
    $allModels: {
      async softDelete<T>(
        this: T,
        where: Prisma.Args<T, 'update'>['where'],
      ): Promise<Prisma.Result<T, unknown, 'update'>> {
        const ctx = Prisma.getExtensionContext(this);
        return (ctx as any).update({
          where,
          data: {
            deletedAt: new Date(),
          },
        } as Prisma.Args<T, 'update'>);
      },
    },
  },
});
