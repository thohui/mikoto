// Generated by Sophon Schema. Do not edit manually!
import { SophonInstance, SenderCore, SophonCore } from "@sophon-js/server";
import { z } from "zod";

////////////////////////////////////////
// Types
////////////////////////////////////////

export const User = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.nullable(z.string()),
  category: z.nullable(z.string()),
});
export type User = z.infer<typeof User>;

export const Role = z.object({
  id: z.string(),
  name: z.string(),
  color: z.nullable(z.string()),
  spaceId: z.string(),
  permissions: z.string(),
  position: z.number().int(),
});
export type Role = z.infer<typeof Role>;

export const Channel = z.object({
  id: z.string(),
  spaceId: z.string(),
  parentId: z.nullable(z.string()),
  name: z.string(),
  order: z.number().int(),
  lastUpdated: z.nullable(z.string()),
  type: z.string(),
});
export type Channel = z.infer<typeof Channel>;

export const Space = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.nullable(z.string()),
  channels: z.array(Channel),
  roles: z.array(Role),
  ownerId: z.nullable(z.string()),
});
export type Space = z.infer<typeof Space>;

export const Member = z.object({
  id: z.string(),
  spaceId: z.string(),
  user: User,
  roleIds: z.array(z.string()),
});
export type Member = z.infer<typeof Member>;

export const Message = z.object({
  id: z.string(),
  content: z.string(),
  timestamp: z.string(),
  authorId: z.nullable(z.string()),
  author: z.nullable(User),
  channelId: z.string(),
});
export type Message = z.infer<typeof Message>;

export const Invite = z.object({
  code: z.string(),
});
export type Invite = z.infer<typeof Invite>;

export const SpaceUpdateOptions = z.object({
  name: z.nullable(z.string()),
  icon: z.nullable(z.string()),
});
export type SpaceUpdateOptions = z.infer<typeof SpaceUpdateOptions>;

export const MemberUpdateOptions = z.object({
  roleIds: z.array(z.string()),
});
export type MemberUpdateOptions = z.infer<typeof MemberUpdateOptions>;

export const UserUpdateOptions = z.object({
  name: z.nullable(z.string()),
  avatar: z.nullable(z.string()),
});
export type UserUpdateOptions = z.infer<typeof UserUpdateOptions>;

export const ChannelCreateOptions = z.object({
  name: z.string(),
  type: z.string(),
  parentId: z.nullable(z.string()),
});
export type ChannelCreateOptions = z.infer<typeof ChannelCreateOptions>;

export const TypingEvent = z.object({
  channelId: z.string(),
  userId: z.string(),
  member: z.nullable(Member),
});
export type TypingEvent = z.infer<typeof TypingEvent>;

export const ListMessageOptions = z.object({
  cursor: z.nullable(z.string()),
  limit: z.number().int(),
});
export type ListMessageOptions = z.infer<typeof ListMessageOptions>;

export const MessageDeleteEvent = z.object({
  messageId: z.string(),
  channelId: z.string(),
});
export type MessageDeleteEvent = z.infer<typeof MessageDeleteEvent>;

export const RoleEditPayload = z.object({
  name: z.nullable(z.string()),
  color: z.nullable(z.string()),
  permissions: z.nullable(z.string()),
  position: z.nullable(z.number().int()),
});
export type RoleEditPayload = z.infer<typeof RoleEditPayload>;

export const VoiceToken = z.object({
  url: z.string(),
  channelId: z.string(),
  token: z.string(),
});
export type VoiceToken = z.infer<typeof VoiceToken>;

export const Relations = z.object({});
export type Relations = z.infer<typeof Relations>;

////////////////////////////////////////
// Services
////////////////////////////////////////

export interface SophonContext {}
export class MainServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
}

export abstract class AbstractMainService {
  $: (room: string) => MainServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new MainServiceSender(sophonCore.senderCore, room);
  }
  abstract spaces: AbstractSpaceService;
  abstract channels: AbstractChannelService;
  abstract members: AbstractMemberService;
  abstract users: AbstractUserService;
  abstract messages: AbstractMessageService;
  abstract roles: AbstractRoleService;
  abstract voice: AbstractVoiceService;
  abstract relations: AbstractRelationService;
}

export class SpaceServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  onCreate(space: Space) {
    this.sender.emit(this.room, "spaces/onCreate", space);
  }
  onUpdate(space: Space) {
    this.sender.emit(this.room, "spaces/onUpdate", space);
  }
  onDelete(space: Space) {
    this.sender.emit(this.room, "spaces/onDelete", space);
  }
}

export abstract class AbstractSpaceService {
  $: (room: string) => SpaceServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new SpaceServiceSender(sophonCore.senderCore, room);
  }

  abstract get(ctx: SophonInstance<SophonContext>, id: string): Promise<Space>;
  abstract list(ctx: SophonInstance<SophonContext>): Promise<Space[]>;
  abstract create(
    ctx: SophonInstance<SophonContext>,
    name: string
  ): Promise<Space>;
  abstract update(
    ctx: SophonInstance<SophonContext>,
    id: string,
    options: SpaceUpdateOptions
  ): Promise<Space>;
  abstract delete(
    ctx: SophonInstance<SophonContext>,
    id: string
  ): Promise<void>;
  abstract join(ctx: SophonInstance<SophonContext>, id: string): Promise<void>;
  abstract leave(ctx: SophonInstance<SophonContext>, id: string): Promise<void>;
  abstract createInvite(
    ctx: SophonInstance<SophonContext>,
    id: string
  ): Promise<Invite>;
  abstract deleteInvite(
    ctx: SophonInstance<SophonContext>,
    code: string
  ): Promise<void>;
  abstract listInvites(
    ctx: SophonInstance<SophonContext>,
    id: string
  ): Promise<Invite[]>;
  abstract addBot(
    ctx: SophonInstance<SophonContext>,
    spaceId: string,
    userId: string
  ): Promise<void>;
}

export class MemberServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  onCreate(member: Member) {
    this.sender.emit(this.room, "members/onCreate", member);
  }
  onUpdate(member: Member) {
    this.sender.emit(this.room, "members/onUpdate", member);
  }
  onDelete(member: Member) {
    this.sender.emit(this.room, "members/onDelete", member);
  }
}

export abstract class AbstractMemberService {
  $: (room: string) => MemberServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new MemberServiceSender(sophonCore.senderCore, room);
  }

  abstract get(
    ctx: SophonInstance<SophonContext>,
    spaceId: string,
    userId: string
  ): Promise<Member>;
  abstract list(
    ctx: SophonInstance<SophonContext>,
    spaceId: string
  ): Promise<Member[]>;
  abstract update(
    ctx: SophonInstance<SophonContext>,
    spaceId: string,
    userId: string,
    roleIds: MemberUpdateOptions
  ): Promise<Member>;
  abstract delete(
    ctx: SophonInstance<SophonContext>,
    spaceId: string,
    userId: string
  ): Promise<void>;
}

export class UserServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
}

export abstract class AbstractUserService {
  $: (room: string) => UserServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new UserServiceSender(sophonCore.senderCore, room);
  }

  abstract me(ctx: SophonInstance<SophonContext>): Promise<User>;
  abstract update(
    ctx: SophonInstance<SophonContext>,
    options: UserUpdateOptions
  ): Promise<User>;
}

export class ChannelServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  onCreate(channel: Channel) {
    this.sender.emit(this.room, "channels/onCreate", channel);
  }
  onUpdate(channel: Channel) {
    this.sender.emit(this.room, "channels/onUpdate", channel);
  }
  onDelete(channel: Channel) {
    this.sender.emit(this.room, "channels/onDelete", channel);
  }
  onTypingStart(event: TypingEvent) {
    this.sender.emit(this.room, "channels/onTypingStart", event);
  }
  onTypingStop(event: TypingEvent) {
    this.sender.emit(this.room, "channels/onTypingStop", event);
  }
}

export abstract class AbstractChannelService {
  $: (room: string) => ChannelServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new ChannelServiceSender(sophonCore.senderCore, room);
  }

  abstract get(
    ctx: SophonInstance<SophonContext>,
    id: string
  ): Promise<Channel>;
  abstract list(
    ctx: SophonInstance<SophonContext>,
    spaceId: string
  ): Promise<Channel[]>;
  abstract create(
    ctx: SophonInstance<SophonContext>,
    spaceId: string,
    options: ChannelCreateOptions
  ): Promise<Channel>;
  abstract delete(
    ctx: SophonInstance<SophonContext>,
    id: string
  ): Promise<void>;
  abstract move(
    ctx: SophonInstance<SophonContext>,
    id: string,
    order: number
  ): Promise<void>;
  abstract startTyping(
    ctx: SophonInstance<SophonContext>,
    channelId: string,
    duration: number
  ): Promise<void>;
  abstract stopTyping(
    ctx: SophonInstance<SophonContext>,
    channelId: string
  ): Promise<void>;
}

export class MessageServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  onCreate(message: Message) {
    this.sender.emit(this.room, "messages/onCreate", message);
  }
  onUpdate(message: Message) {
    this.sender.emit(this.room, "messages/onUpdate", message);
  }
  onDelete(event: MessageDeleteEvent) {
    this.sender.emit(this.room, "messages/onDelete", event);
  }
}

export abstract class AbstractMessageService {
  $: (room: string) => MessageServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new MessageServiceSender(sophonCore.senderCore, room);
  }

  abstract list(
    ctx: SophonInstance<SophonContext>,
    channelId: string,
    options: ListMessageOptions
  ): Promise<Message[]>;
  abstract send(
    ctx: SophonInstance<SophonContext>,
    channelId: string,
    content: string
  ): Promise<Message>;
  abstract delete(
    ctx: SophonInstance<SophonContext>,
    channelId: string,
    messageId: string
  ): Promise<void>;
  abstract ack(
    ctx: SophonInstance<SophonContext>,
    channelId: string,
    timestamp: string
  ): Promise<void>;
}

export class RoleServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  onCreate(role: Role) {
    this.sender.emit(this.room, "roles/onCreate", role);
  }
  onUpdate(role: Role) {
    this.sender.emit(this.room, "roles/onUpdate", role);
  }
  onDelete(role: Role) {
    this.sender.emit(this.room, "roles/onDelete", role);
  }
}

export abstract class AbstractRoleService {
  $: (room: string) => RoleServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new RoleServiceSender(sophonCore.senderCore, room);
  }

  abstract create(
    ctx: SophonInstance<SophonContext>,
    spaceId: string,
    name: string
  ): Promise<Role>;
  abstract edit(
    ctx: SophonInstance<SophonContext>,
    id: string,
    edit: RoleEditPayload
  ): Promise<Role>;
  abstract delete(
    ctx: SophonInstance<SophonContext>,
    id: string
  ): Promise<void>;
}

export class VoiceServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
}

export abstract class AbstractVoiceService {
  $: (room: string) => VoiceServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new VoiceServiceSender(sophonCore.senderCore, room);
  }

  abstract join(
    ctx: SophonInstance<SophonContext>,
    channelId: string
  ): Promise<VoiceToken>;
}

export class RelationServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
}

export abstract class AbstractRelationService {
  $: (room: string) => RelationServiceSender;
  public constructor(protected sophonCore: SophonCore<SophonContext>) {
    this.$ = (room) => new RelationServiceSender(sophonCore.senderCore, room);
  }
}
