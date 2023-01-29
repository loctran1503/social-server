import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chatroom } from './chatroom.entity';
import { MediaMessage } from '../../chat/entities/media-message.entity';

@Entity('chats-room-message')
export class ChatRoomMessage {
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @ManyToOne(() => User, (user) => user.chatRoomMessages)
  user: User;

  @ManyToOne(() => Chatroom, (chatroom) => chatroom.chatRoomMessages,{cascade: true})
  chatroom: Chatroom;

  @Column({nullable:true})
  content?: string;

  @Column({default:'text'})
  type:'audio' | 'image' | 'video' | 'file' | 'call-video' | 'call-audio' | 'text' | 'removed' | 'icon'

  @Column({nullable:true})
  emoji?:string

  @Column({default:false})
  isSeen:boolean

  @OneToOne(() => MediaMessage, { nullable: true })
  @JoinColumn()
  media?: MediaMessage;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;
}
