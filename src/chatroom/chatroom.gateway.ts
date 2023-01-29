import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IORedisKey } from '../redis/redis.module';
import { DataSource } from 'typeorm';
import { isProduction, REDIT_CHAT_ROOM_SOCKET_LIST } from '../util/constants';
import { ChatroomService } from './chatroom.service';

import Redis from 'ioredis';
import { User } from 'src/users/entities/user.entity';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { ClientDeleteChatRoomMessageDto, ClientSendChatRoomMessageDto, ClientSendChatRoomMessageIconDto, ClientSendImageChatRoomMessageDto, ClientSendStopCallVideo, ClientUpdateChatRoomMessageEmojiDto } from './dto/chatroom.dto';


@WebSocketGateway({
  transports: ['websocket'],
  cors: {
    origin: isProduction ? process.env.CORS_PROD : process.env.CORS_DEV,
  },
  namespace: 'social/api/chat-room',
  path: '/social/api/chat-room/socket.io',
})
export class ChatroomGateway {
  constructor(
    private readonly chatroomService: ChatroomService,
    private readonly dataSource: DataSource,
    private readonly config : ConfigService,
    
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {}
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatroomGateway.name);



  listenForMessages() {
    this.server.on('connection',async (ws) => {
      try {
        const token = ws.handshake.auth.token;
      const userRepository = this.dataSource.getRepository(User);

      const decoded = verify(
        token,
        this.config.get('ACCESS_TOKEN_SECRET'),
      ) as JwtPayload & { sub: string };
      if (decoded.sub) {
        const userExisting = await userRepository.findOne({
          where:{
            userId:decoded.sub
          }
        })
        if (!userExisting) throw new UnauthorizedException('user not found');
      
      await  this.redisClient.hset(REDIT_CHAT_ROOM_SOCKET_LIST,{
          [userExisting.userId]:ws.id
        })
      }
      this.server.socketsJoin(ws.id)
      } catch (error) {
        this.logger.error(error)
      }

    })
  }

  afterInit(socket: Server) {
    this.listenForMessages();
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
  
  }

  // @SubscribeMessage('createChatroom')
  // create(@MessageBody() createChatroomDto: CreateChatroomDto) {
  //   return this.chatroomService.create(createChatroomDto);
  // }

  //========================================================================================
  //   clientSendMessage
  //========================================================================================
  @SubscribeMessage('client-send-message')
 async clientSendMessage(@MessageBody('dto') dto: ClientSendChatRoomMessageDto,@ConnectedSocket() client: Socket) {
    return await this.chatroomService.clientSendMessage(dto,client,this.redisClient,this.server);
  }

  @SubscribeMessage('client-send-media') 
 async clientSendMedia(@MessageBody('dto') dto : ClientSendImageChatRoomMessageDto,@ConnectedSocket() client: Socket) {

  
    return await this.chatroomService.clientSendMedia(dto,client,this.redisClient,this.server);
  }

 

  @SubscribeMessage('client-update-chatroom-message-emoji')
 async clientUpdateMessageEmoji(@MessageBody('dto') dto: ClientUpdateChatRoomMessageEmojiDto,@ConnectedSocket() client: Socket) {
    return await this.chatroomService.clientUpdateMessageEmoji(dto,this.server,client,this.redisClient);
  }

  @SubscribeMessage('client-remove-chatroom-message')
 async clientRemoveMessage(@MessageBody('dto') dto: ClientDeleteChatRoomMessageDto,@ConnectedSocket() client: Socket) {
    return await this.chatroomService.clientRemoveMessage(dto,this.server,client,this.redisClient,);
  }


  // Video
  @SubscribeMessage('client-request-call-video')
 async clientRequestCallVideo(@MessageBody('dto') dto ) {
    return await this.chatroomService.clientRequestCallVideo(dto,this.redisClient,this.server);
  }

  @SubscribeMessage('client-send-decline-call-video')
  async clientSendDeclineCallVideo(@MessageBody('dto') dto ) {

    
     return await this.chatroomService.clientSendDeclineCallVideo(dto,this.redisClient,this.server);
   }

  @SubscribeMessage('client-send-end-call')
 async clientSendEndCall(@MessageBody('dto') dto  ) {
  
    return await this.chatroomService.clientSendEndCall(dto,this.redisClient,this.server);
  }

  @SubscribeMessage('client-send-call-video-stop')
 async clientSendCallVideoStop(@MessageBody('dto') dto : ClientSendStopCallVideo,@ConnectedSocket() client: Socket ) {
    return await this.chatroomService.clientSendCallVideoStop(dto,this.redisClient,this.server,client);
  }

  @SubscribeMessage('user-logout')
 async userLogout(@ConnectedSocket() client: Socket ) {  
    return await this.chatroomService.userLogout(client);
  }


}
