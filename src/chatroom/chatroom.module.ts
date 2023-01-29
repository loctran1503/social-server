import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomGateway } from './chatroom.gateway';
import { ChatroomController } from './chatroom.controller';
import { MediaService } from '../chat/media.service';

@Module({
  providers: [ChatroomGateway, ChatroomService,MediaService],
  controllers:[ChatroomController]
})
export class ChatroomModule {}
