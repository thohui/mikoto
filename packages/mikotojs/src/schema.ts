// Generated by Sophon Schema. Do not edit manually!
import io, { Socket } from 'socket.io-client';

export interface Channel {
  id: string;
  spaceId: string;
  parentId: string | null;
  name: string;
  order: number;
  lastUpdated: string | null;
  type: string;
}

export interface Space {
  id: string;
  name: string;
  channels: Channel[];
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  color: string | null;
  permissions: string;
  position: number;
}

export interface Member {
  id: string;
  spaceId: string;
  user: User;
  roleIds: string[];
}

export interface User {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  authorId: string | null;
  author: User | null;
  channelId: string;
}

export interface MemberUpdateOptions {
  roleIds: string[];
}

export interface ChannelCreateOptions {
  name: string;
  type: string;
}

export interface ListMessageOptions {
  cursor: string | null;
  limit: number;
}

export interface MessageDeleteEvent {
  messageId: string;
  channelId: string;
}

export interface VoiceToken {
  url: string;
  channelId: string;
  token: string;
}

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
  constructor(private socket: SocketClient) {
    this.spaces = new SpaceServiceClient(socket);
    this.channels = new ChannelServiceClient(socket);
    this.members = new MemberServiceClient(socket);
    this.users = new UserServiceClient(socket);
    this.messages = new MessageServiceClient(socket);
    this.roles = new RoleServiceClient(socket);
    this.voice = new VoiceServiceClient(socket);
  }
}

export class SpaceServiceClient {
  constructor(private socket: SocketClient) {}
  get(id: string): Promise<Space> {
    return this.socket.call('spaces/get', id);
  }
  list(): Promise<Space[]> {
    return this.socket.call('spaces/list');
  }
  create(name: string): Promise<Space> {
    return this.socket.call('spaces/create', name);
  }
  delete(id: string): Promise<void> {
    return this.socket.call('spaces/delete', id);
  }
  join(id: string): Promise<void> {
    return this.socket.call('spaces/join', id);
  }
  leave(id: string): Promise<void> {
    return this.socket.call('spaces/leave', id);
  }

  onCreate(handler: (space: Space) => void) {
    return this.socket.subscribe('spaces/onCreate', handler);
  }
  onUpdate(handler: (space: Space) => void) {
    return this.socket.subscribe('spaces/onUpdate', handler);
  }
  onDelete(handler: (space: Space) => void) {
    return this.socket.subscribe('spaces/onDelete', handler);
  }
}

export class MemberServiceClient {
  constructor(private socket: SocketClient) {}
  get(spaceId: string, userId: string): Promise<Member> {
    return this.socket.call('members/get', spaceId, userId);
  }
  update(
    spaceId: string,
    userId: string,
    roleIds: MemberUpdateOptions,
  ): Promise<Member> {
    return this.socket.call('members/update', spaceId, userId, roleIds);
  }
}

export class UserServiceClient {
  constructor(private socket: SocketClient) {}
  me(): Promise<User> {
    return this.socket.call('users/me');
  }
}

export class ChannelServiceClient {
  constructor(private socket: SocketClient) {}
  get(id: string): Promise<Channel> {
    return this.socket.call('channels/get', id);
  }
  list(spaceId: string): Promise<Channel[]> {
    return this.socket.call('channels/list', spaceId);
  }
  create(spaceId: string, options: ChannelCreateOptions): Promise<Channel> {
    return this.socket.call('channels/create', spaceId, options);
  }
  delete(id: string): Promise<void> {
    return this.socket.call('channels/delete', id);
  }
  move(id: string, order: number): Promise<void> {
    return this.socket.call('channels/move', id, order);
  }

  onCreate(handler: (channel: Channel) => void) {
    return this.socket.subscribe('channels/onCreate', handler);
  }
  onUpdate(handler: (channel: Channel) => void) {
    return this.socket.subscribe('channels/onUpdate', handler);
  }
  onDelete(handler: (channel: Channel) => void) {
    return this.socket.subscribe('channels/onDelete', handler);
  }
}

export class MessageServiceClient {
  constructor(private socket: SocketClient) {}
  list(channelId: string, options: ListMessageOptions): Promise<Message[]> {
    return this.socket.call('messages/list', channelId, options);
  }
  send(channelId: string, content: string): Promise<Message> {
    return this.socket.call('messages/send', channelId, content);
  }
  delete(channelId: string, messageId: string): Promise<void> {
    return this.socket.call('messages/delete', channelId, messageId);
  }

  onCreate(handler: (message: Message) => void) {
    return this.socket.subscribe('messages/onCreate', handler);
  }
  onUpdate(handler: (message: Message) => void) {
    return this.socket.subscribe('messages/onUpdate', handler);
  }
  onDelete(handler: (event: MessageDeleteEvent) => void) {
    return this.socket.subscribe('messages/onDelete', handler);
  }
}

export class RoleServiceClient {
  constructor(private socket: SocketClient) {}
}

export class VoiceServiceClient {
  constructor(private socket: SocketClient) {}
  join(channelId: string): Promise<VoiceToken> {
    return this.socket.call('voice/join', channelId);
  }
}

export function createClient(
  options: { url: string; params?: Record<string, string> },
  onConnect: (client: MainServiceClient) => void,
) {
  const socket = io(options.url, { query: options.params });

  socket.once('connect', () => {
    const socketClient = new SocketClient(socket);
    onConnect(new MainServiceClient(socketClient));
  });

  return () => {
    socket.disconnect();
  };
}
