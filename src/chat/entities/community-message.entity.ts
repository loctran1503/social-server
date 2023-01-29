import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MediaMessage } from './media-message.entity';

@Entity({ name: 'community-messages' })
export class CommunityMessage {
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @ManyToOne(() => User, (user) => user.communityMessage)
  user: User;

  @Column()
  content: string;

  @OneToOne(() => MediaMessage, { nullable: true })
  @JoinColumn()
  media?: MediaMessage;
  
  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;
}
