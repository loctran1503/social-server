import { User } from '../../users/entities/user.entity';
import { DefaultResponse } from '../../util/types';
import { ChatRoomMessage } from '../entities/chatroom-message.entity';
import { Chatroom } from '../entities/chatroom.entity';

export interface ClientSendChatRoomMessageDto {
  content: string;
  type:
    | 'audio'
    | 'image'
    | 'video'
    | 'file'
    | 'call-video'
    | 'call-audio'
    | 'text'
    | 'removed'
    | 'icon';
  haveChatRoom: boolean;
  receiverId: string;
}

export interface ClientSendImageChatRoomMessageDto {
  receiver: User;
  media: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
}

export interface ClientUpdateChatRoomMessageEmojiDto {
  emoji: string;
  receiver: User;
  message: ChatRoomMessage;
}

export interface ClientDeleteChatRoomMessageDto {
  receiver: User;
  message: ChatRoomMessage;
}

export interface ClientSendChatRoomMessageIconDto {
  receiver: User;
  icon: string;
}

export interface ClientSendStopCallVideo{
    receiver:User;
    sender:User;
    timing:string
}

export interface GetChatRoomDto extends DefaultResponse {
  receiver?: User;
  messageList?: ChatRoomMessage[];
}

export interface GetAllChatRoomDto extends DefaultResponse {
  chatRooms?: Chatroom[];
}
