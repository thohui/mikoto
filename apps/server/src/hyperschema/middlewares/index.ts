import { NotFoundError, UnauthorizedError } from '@hyperschema/core';
import { checkPermission, permissions } from '@mikoto-io/permcheck';
import { Channel, SpaceUser } from '@prisma/client';

import { prisma } from '../../functions/prisma';
import { HSContext } from '../core';

export async function assertSpaceMembership<
  T extends HSContext & { spaceId: string },
>(props: T): Promise<T> {
  const membership = await prisma.spaceUser.findUnique({
    where: {
      userId_spaceId: {
        userId: props.state.user.id,
        spaceId: props.spaceId,
      },
    },
  });
  if (membership === null) throw new UnauthorizedError('Not a member of space');
  return props;
}

export async function assertChannelMembership<
  T extends HSContext & { channelId: string },
>(props: T): Promise<T & { channel: Channel; member: SpaceUser }> {
  const channel = await prisma.channel.findUnique({
    where: { id: props.channelId },
  });
  if (channel === null) throw new NotFoundError('Channel not found');
  const membership = await prisma.spaceUser.findUnique({
    where: {
      userId_spaceId: {
        userId: props.state.user.id,
        spaceId: channel.spaceId,
      },
    },
  });

  if (membership === null)
    throw new UnauthorizedError('Not a member of channel');
  return { ...props, channel, member: membership };
}

export function requireSpacePerm<T extends HSContext & { spaceId: string }>(
  rule: bigint,
  superuserOverride = true,
) {
  return async (props: T): Promise<T> => {
    let r = typeof rule === 'string' ? BigInt(rule) : rule;

    const spc = await prisma.space.findUnique({
      where: { id: props.spaceId },
    });
    if (spc === null) throw new NotFoundError('Space not found');
    if (spc.ownerId === props.state.user.id) return props;
    const member = await prisma.spaceUser.findUnique({
      where: {
        userId_spaceId: { userId: props.state.user.id, spaceId: props.spaceId },
      },
      include: { roles: true },
    });
    if (member === null) throw new NotFoundError('Not a member of space');

    const totalPerms = member.roles.reduce(
      (acc, x) => acc | BigInt(x.permissions),
      0n,
    );

    if (superuserOverride) {
      r |= permissions.superuser;
    }
    const res = checkPermission(r, totalPerms);
    if (!res) throw new UnauthorizedError('Insufficient permissions');

    return props;
  };
}