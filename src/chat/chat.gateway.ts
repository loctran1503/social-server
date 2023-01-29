import {
  Inject,
  Logger,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets/decorators';

import 'dotenv/config';
import { JwtPayload, verify } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { ChatService } from './chat.service';
import { Redis } from 'ioredis';
import {
  BLOCKING_MESSAGE_DURATION,
  isProduction,
  REDIT_CHAT_BLOCKING,
  REDIT_SOCKET_ID_LIST,
} from '../util/constants';
import MessageBlocker from '../util/MessageBlocker';
import SocketManager from '../util/SocketManager';
import { CommunityMessage } from './entities/community-message.entity';
import { IORedisKey } from '../redis/redis.module';
import { MediaService } from './media.service';
import { CreateCommunityMessage } from './dto/message.dto';
import { MediaMessage } from './entities/media-message.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { writeFile } from 'fs';
import { ConsoleLogger } from '@nestjs/common/services';

@WebSocketGateway({
  transports: ['websocket'],
  cors: {
    origin: isProduction ? process.env.CORS_PROD : process.env.CORS_DEV,
  },
  namespace: 'social/api/chat',
  path: '/social/api/chat/socket.io',
})
export class ChatGateWay implements OnGatewayInit, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateWay.name);
  @WebSocketServer() socket: Server;
  constructor(
    private mediaService: MediaService,
    private dataSource: DataSource,
    private config: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {}
  listenForMessages() {
    this.socket.on('connection', (ws) => {
      //console.log(ws.id, 'is connecting.....');
    });
  }
  afterInit(socket: Server) {
    this.listenForMessages();
  }
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.redisClient.srem(REDIT_SOCKET_ID_LIST, client.id);
  }

  @SubscribeMessage('client-send-indentify')
  async clientSendIndentify(
    @MessageBody('name') name: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.redisClient.sadd(REDIT_SOCKET_ID_LIST, client.id);
    } catch (error) {
      console.log(
        `Chat.gateway.ts - client-send-identify error:${JSON.stringify(error)}`,
      );
    }
  }

  @SubscribeMessage('client-send-message')
  async sendMessage(
    @MessageBody('message') message: CreateCommunityMessage,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client.handshake.auth.token;
      const userRepository = this.dataSource.getRepository(User);
      const mediaRepository = this.dataSource.getRepository(MediaMessage);
      const communityMessageRepository =
        this.dataSource.getRepository(CommunityMessage);
      const decoded = verify(
        token,
        this.config.get('ACCESS_TOKEN_SECRET'),
      ) as JwtPayload & { sub: string };
      if (decoded.sub) {
        const userExisting = await userRepository.findOne({
          where: {
            userId: decoded.sub,
          },
        });
        if (!userExisting) throw new UnauthorizedException('user not found');

        //Check is blocking
        //Case:null
        const result = await this.redisClient.hget(
          REDIT_CHAT_BLOCKING,
          userExisting.userId,
          async (err) => {
            if (err) this.logger.error(err);
          },
        );
        if (!result) {
          //None value => create new value-expire
          await this.redisClient.hset(REDIT_CHAT_BLOCKING, {
            [userExisting.userId]: Date.now() + BLOCKING_MESSAGE_DURATION,
          });
        } else {
          //Have value => check value
          if (Number.parseInt(result) >= Date.now()) {
            //Blocking
            console.log(`user ${userExisting.name} is blocking`);
            return;
          } else {
            await this.redisClient.hset(REDIT_CHAT_BLOCKING, {
              [userExisting.userId]: Date.now() + BLOCKING_MESSAGE_DURATION,
            });
          }
        }

        let mediaTemp: MediaMessage;

        //Have media
        if (message.media) {
          const media = await this.mediaService.uploadFile(message.media);
          if (media) {
            mediaTemp = await mediaRepository.save(media);
          }
        }

        const newMessage = await communityMessageRepository.save(
          communityMessageRepository.create({
            content: message.content,
            user: userExisting,
            media: mediaTemp,
          }),
        );

        const messageForClient = {
          ...newMessage,
          user: {
            userId: userExisting.userId,
            name: userExisting.name,
            avatar: userExisting.avatar,
          },
          timestampBlocking: BLOCKING_MESSAGE_DURATION,
        };
        this.socket.emit('server-send-message', messageForClient);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  // @Cron(CronExpression.EVERY_DAY_AT_3PM)
  // async handleDeleteMessage() {
  //   try {
  //     await this.dataSource.getRepository(Message).clear();
  //   } catch (error) {
  //     console.log(
  //       `handleDeleteMessage Interal Server Error: ${JSON.stringify(error)}`,
  //     );
  //   }
  // }
}
