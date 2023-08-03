import { checkPermission, spacePermissions } from '@mikoto-io/permcheck';
import { ForbiddenError, NotFoundError } from 'routing-controllers';

import { prisma } from './prisma';

export async function assertMembership(userId: string, spaceId: string) {
  const membership = await prisma.spaceUser.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  if (membership === null) throw new ForbiddenError('Not a member of space');
}

export async function assertPermission(
  userId: string,
  spaceId: string,
  rule: string | bigint,
  superuserOverride = true,
) {
  let r = typeof rule === 'string' ? BigInt(rule) : rule;

  const spc = await prisma.space.findUnique({
    where: { id: spaceId },
  });
  if (spc === null) throw new NotFoundError('Space not found');
  if (spc.ownerId === userId) return;
  const member = await prisma.spaceUser.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
    include: { roles: true },
  });
  if (member === null) throw new ForbiddenError('Not a member of space');

  const totalPerms = member.roles.reduce(
    (acc, x) => acc | BigInt(x.permissions),
    0n,
  );

  if (superuserOverride) {
    r |= spacePermissions.superuser;
  }
  const res = checkPermission(r, totalPerms);
  if (!res) throw new ForbiddenError('Insufficient permissions');
}

export async function assertOwnership(userId: string, spaceId: string) {
  const spc = await prisma.space.findUnique({
    where: { id: spaceId },
  });
  if (spc === null) throw new NotFoundError('Space not found');
  if (spc.ownerId !== userId) throw new ForbiddenError('Not space owner');
}
