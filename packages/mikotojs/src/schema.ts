// Generated by Sophon Schema. Do not edit manually!
import io, { Socket } from "socket.io-client";
import { z } from "zod";

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

class SocketClient {
  constructor(public socket: Socket) {}

  call(event: string, ...args: any[]): any {
    return new Promise((resolve, reject) => {
      this.socket.emit(event, ...args, (x: any) => {
        if (x.err !== undefined) {
          reject(x.err);
        } else {
          resolve(x.ok);
        }
      });
    });
  }

  subscribe(ev: string, handler: any) {
    this.socket.on(ev, handler);
    return () => {
      this.socket.off(ev, handler);
    };
  }
}

export class MainServiceClient {
  readonly spaces: SpaceServiceClient;
  readonly channels: ChannelServiceClient;
  readonly members: MemberServiceClient;
  readonly users: UserServiceClient;
  readonly messages: MessageServiceClient;
  readonly roles: RoleServiceClient;
  readonly voice: VoiceServiceClient;
  readonly relations: RelationServiceClient;
  constructor(private socket: SocketClient) {
    this.spaces = new SpaceServiceClient(socket);
    this.channels = new ChannelServiceClient(socket);
    this.members = new MemberServiceClient(socket);
    this.users = new UserServiceClient(socket);
    this.messages = new MessageServiceClient(socket);
    this.roles = new RoleServiceClient(socket);
    this.voice = new VoiceServiceClient(socket);
    this.relations = new RelationServiceClient(socket);
  }
}

export class SpaceServiceClient {
  constructor(private socket: SocketClient) {}
  get(id: string): Promise<Space> {
    return this.socket.call("spaces/get", id);
  }
  list(): Promise<Space[]> {
    return this.socket.call("spaces/list");
  }
  create(name: string): Promise<Space> {
    return this.socket.call("spaces/create", name);
  }
  update(id: string, options: SpaceUpdateOptions): Promise<Space> {
    return this.socket.call("spaces/update", id, options);
  }
  delete(id: string): Promise<void> {
    return this.socket.call("spaces/delete", id);
  }
  join(id: string): Promise<void> {
    return this.socket.call("spaces/join", id);
  }
  leave(id: string): Promise<void> {
    return this.socket.call("spaces/leave", id);
  }
  createInvite(id: string): Promise<Invite> {
    return this.socket.call("spaces/createInvite", id);
  }
  deleteInvite(code: string): Promise<void> {
    return this.socket.call("spaces/deleteInvite", code);
  }
  listInvites(id: string): Promise<Invite[]> {
    return this.socket.call("spaces/listInvites", id);
  }
  addBot(spaceId: string, userId: string): Promise<void> {
    return this.socket.call("spaces/addBot", spaceId, userId);
  }

  onCreate(handler: (space: Space) => void) {
    return this.socket.subscribe("spaces/onCreate", handler);
  }
  onUpdate(handler: (space: Space) => void) {
    return this.socket.subscribe("spaces/onUpdate", handler);
  }
  onDelete(handler: (space: Space) => void) {
    return this.socket.subscribe("spaces/onDelete", handler);
  }
}

export class MemberServiceClient {
  constructor(private socket: SocketClient) {}
  get(spaceId: string, userId: string): Promise<Member> {
    return this.socket.call("members/get", spaceId, userId);
  }
  list(spaceId: string): Promise<Member[]> {
    return this.socket.call("members/list", spaceId);
  }
  update(
    spaceId: string,
    userId: string,
    roleIds: MemberUpdateOptions
  ): Promise<Member> {
    return this.socket.call("members/update", spaceId, userId, roleIds);
  }
  delete(spaceId: string, userId: string): Promise<void> {
    return this.socket.call("members/delete", spaceId, userId);
  }
}

export class UserServiceClient {
  constructor(private socket: SocketClient) {}
  me(): Promise<User> {
    return this.socket.call("users/me");
  }
  update(options: UserUpdateOptions): Promise<User> {
    return this.socket.call("users/update", options);
  }
}

export class ChannelServiceClient {
  constructor(private socket: SocketClient) {}
  get(id: string): Promise<Channel> {
    return this.socket.call("channels/get", id);
  }
  list(spaceId: string): Promise<Channel[]> {
    return this.socket.call("channels/list", spaceId);
  }
  create(spaceId: string, options: ChannelCreateOptions): Promise<Channel> {
    return this.socket.call("channels/create", spaceId, options);
  }
  delete(id: string): Promise<void> {
    return this.socket.call("channels/delete", id);
  }
  move(id: string, order: number): Promise<void> {
    return this.socket.call("channels/move", id, order);
  }
  startTyping(channelId: string, duration: number): Promise<void> {
    return this.socket.call("channels/startTyping", channelId, duration);
  }
  stopTyping(channelId: string): Promise<void> {
    return this.socket.call("channels/stopTyping", channelId);
  }

  onCreate(handler: (channel: Channel) => void) {
    return this.socket.subscribe("channels/onCreate", handler);
  }
  onUpdate(handler: (channel: Channel) => void) {
    return this.socket.subscribe("channels/onUpdate", handler);
  }
  onDelete(handler: (channel: Channel) => void) {
    return this.socket.subscribe("channels/onDelete", handler);
  }
  onTypingStart(handler: (event: TypingEvent) => void) {
    return this.socket.subscribe("channels/onTypingStart", handler);
  }
  onTypingStop(handler: (event: TypingEvent) => void) {
    return this.socket.subscribe("channels/onTypingStop", handler);
  }
}

export class MessageServiceClient {
  constructor(private socket: SocketClient) {}
  list(channelId: string, options: ListMessageOptions): Promise<Message[]> {
    return this.socket.call("messages/list", channelId, options);
  }
  send(channelId: string, content: string): Promise<Message> {
    return this.socket.call("messages/send", channelId, content);
  }
  delete(channelId: string, messageId: string): Promise<void> {
    return this.socket.call("messages/delete", channelId, messageId);
  }
  ack(channelId: string, timestamp: string): Promise<void> {
    return this.socket.call("messages/ack", channelId, timestamp);
  }

  onCreate(handler: (message: Message) => void) {
    return this.socket.subscribe("messages/onCreate", handler);
  }
  onUpdate(handler: (message: Message) => void) {
    return this.socket.subscribe("messages/onUpdate", handler);
  }
  onDelete(handler: (event: MessageDeleteEvent) => void) {
    return this.socket.subscribe("messages/onDelete", handler);
  }
}

export class RoleServiceClient {
  constructor(private socket: SocketClient) {}
  create(spaceId: string, name: string): Promise<Role> {
    return this.socket.call("roles/create", spaceId, name);
  }
  edit(id: string, edit: RoleEditPayload): Promise<Role> {
    return this.socket.call("roles/edit", id, edit);
  }
  delete(id: string): Promise<void> {
    return this.socket.call("roles/delete", id);
  }
}

export class VoiceServiceClient {
  constructor(private socket: SocketClient) {}
  join(channelId: string): Promise<VoiceToken> {
    return this.socket.call("voice/join", channelId);
  }
}

export class RelationServiceClient {
  constructor(private socket: SocketClient) {}
}

export function createClient(
  options: { url: string; params?: Record<string, string> },
  onConnect: (client: MainServiceClient) => void
) {
  const socket = io(options.url, { query: options.params });

  socket.once("connect", () => {
    const socketClient = new SocketClient(socket);
    onConnect(new MainServiceClient(socketClient));
  });

  return () => {
    socket.disconnect();
  };
}
