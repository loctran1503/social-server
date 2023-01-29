import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { JwtPayload, verify } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { MediaService } from '../chat/media.service';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  REDIT_CHAT_ROOM_SOCKET_LIST,
  regexExp,
  responseCode,
} from '../util/constants';
import {
  ClientDeleteChatRoomMessageDto,
  ClientSendChatRoomMessageDto,
  ClientSendImageChatRoomMessageDto,
  ClientSendStopCallVideo,
  ClientUpdateChatRoomMessageEmojiDto,
  GetAllChatRoomDto,
  GetChatRoomDto,
} from './dto/chatroom.dto';
import { ChatRoomMessage } from './entities/chatroom-message.entity';
import { Chatroom } from './entities/chatroom.entity';
import { MediaMessage } from '../chat/entities/media-message.entity';

@Injectable()
export class ChatroomService {
  private readonly logger = new Logger(ChatroomService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private mediaService: MediaService,
  ) {}

  async userLogout(socket : Socket){

    
    try {
      const userRepository = this.dataSource.getRepository(User);
      const token = socket.handshake.auth.token;

      const decoded = verify(
        token,
        this.config.get('ACCESS_TOKEN_SECRET'),
      ) as JwtPayload & { sub: string };
      let userExisting: User;

      if (!regexExp.test(decoded.sub)) {
        throw new Error('invalid uuid');
      }

      userExisting = await userRepository.findOne({
        where: {
          userId: decoded.sub,
        },
      });
      if (!userExisting) throw new UnauthorizedException('user not found');

      userExisting.isOnline=false;
      await userRepository.save(userExisting);
    } catch (error) {
      this.logger.error('userLogout',error)
    }
  }

  async setIsSeen(sender: User, receiver : User) {
    try {
      const chatRoomRepository = this.dataSource.getRepository(Chatroom);
     
      const chatRoomMessageRepository =
        this.dataSource.getRepository(ChatRoomMessage);
    
        const chatRoom = await chatRoomRepository
        .createQueryBuilder('chats-room')
        .select('chats-room')
        .where('chats-room.userOne.userId In(:...ids)', {
          ids: [sender.userId, receiver.userId],
        })
        .andWhere('chats-room.userTwo.userId In(:...ids)', {
          ids: [sender.userId, receiver.userId],
        })

        .leftJoinAndSelect('chats-room.userOne', 'userOne')
        .leftJoinAndSelect('chats-room.userTwo', 'userTwo')
        .getOne();

      if(!chatRoom) return {
        success:false,
        code:responseCode.INVALID
      }


      const messageNotSeen = await chatRoomMessageRepository.find({
        where: {
          isSeen: false,
          chatroom:{
            chatroomId:chatRoom.chatroomId
          },
        },
        relations: {
          chatroom: true,
        },
      });

      const result = await Promise.all(
        messageNotSeen.map(async (item) => {
          item.isSeen = true;

          return await chatRoomMessageRepository.save(item);
        }),
      )
        .then((data) => {
          return data;
        })
        .catch((err) => console.log(err));
      if (result) {
        return {
          success: true,
          code: responseCode.SUCCESS,
        };
      } else {
        return {
          success: false,
          code: responseCode.NOT_FOUND,
        };
      }
    } catch (error) {
      this.logger.error('setIsSeen', error);
      return {
        success: false,
        code: responseCode.INTERNAL_ERROR,
      };
    }
  }

  async getChatRoom(
    receiverId: string,
    userExisting: User,
  ): Promise<GetChatRoomDto> {
    try {
      if (!regexExp.test(receiverId))
        return {
          success: false,
          code: responseCode.INVALID,
        };
      const chatRoomRepository = this.dataSource.getRepository(Chatroom);
      const userRepository = this.dataSource.getRepository(User);
      const chatRoomMessageRepository =
        this.dataSource.getRepository(ChatRoomMessage);
      const receiverExisting = await userRepository.findOne({
        where: {
          userId: receiverId,
        },
      });
      if (!receiverExisting)
        return {
          code: responseCode.NOT_FOUND,
          success: false,
        };
      const chatRoom = await chatRoomRepository
        .createQueryBuilder('chats-room')
        .select('chats-room')
        .where('chats-room.userOne.userId In(:...ids)', {
          ids: [userExisting.userId, receiverExisting.userId],
        })
        .andWhere('chats-room.userTwo.userId In(:...ids)', {
          ids: [userExisting.userId, receiverExisting.userId],
        })

        .leftJoinAndSelect('chats-room.userOne', 'userOne')
        .leftJoinAndSelect('chats-room.userTwo', 'userTwo')
        .getOne();

      if (!chatRoom) {
        return {
          success: true,
          code: responseCode.SUCCESS,
          receiver: receiverExisting,
        };
      } else {
        const allMessage = await chatRoomMessageRepository.find({
          where: {
            chatroom: {
              chatroomId: chatRoom.chatroomId,
            },
          },
          order: {
            timestamp: 'DESC',
          },
          relations: {
            user: true,
            media: true,
            chatroom: true,
          },
        });

        return {
          code: responseCode.SUCCESS,
          success: true,
          messageList: allMessage,
          receiver: receiverExisting,
        };
      }
    } catch (error) {
      this.logger.error(error);
      return {
        code: responseCode.INTERNAL_ERROR,
        success: false,
      };
    }
  }

  //========================================================================================
  //   clientSendMessage
  //========================================================================================
  async clientSendMessage(
    dto: ClientSendChatRoomMessageDto,
    socket: Socket,
    redis: Redis,
    server: Server,
  ) {
    try {
      const chatRoomRepository = this.dataSource.getRepository(Chatroom);
      const chatRoomMessageRepository =
        this.dataSource.getRepository(ChatRoomMessage);
      const userRepository = this.dataSource.getRepository(User);

      const token = socket.handshake.auth.token;

      const decoded = verify(
        token,
        this.config.get('ACCESS_TOKEN_SECRET'),
      ) as JwtPayload & { sub: string };
      let userExisting: User;

      if (!regexExp.test(decoded.sub)) {
        throw new Error('invalid uuid');
      }

      userExisting = await userRepository.findOne({
        where: {
          userId: decoded.sub,
        },
      });
      if (!userExisting) throw new UnauthorizedException('user not found');

      const receiverExisting = await userRepository.findOne({
        where: {
          userId: dto.receiverId,
        },
      });

      if (!receiverExisting) throw new UnauthorizedException('user not found');

      if (dto.haveChatRoom) {
        const chatRoom = await chatRoomRepository
          .createQueryBuilder('chats-room')
          .select('chats-room')
          .where('chats-room.userOne.userId In(:...ids)', {
            ids: [userExisting.userId, receiverExisting.userId],
          })
          .andWhere('chats-room.userTwo.userId In(:...ids)', {
            ids: [userExisting.userId, receiverExisting.userId],
          })
          .leftJoinAndSelect('chats-room.userOne', 'userOne')
          .leftJoinAndSelect('chats-room.userTwo', 'userTwo')
          .getOne();

        if (!chatRoom) throw new Error('chat room not found');

        let messageCreated: ChatRoomMessage;
        switch (dto.type) {
          case 'text':
            messageCreated = chatRoomMessageRepository.create({
              content: dto.content,
              chatroom: chatRoom,
              user: userExisting,
              type: 'text',
            });
            break;
          case 'icon':
            messageCreated = chatRoomMessageRepository.create({
              content: dto.content,
              chatroom: chatRoom,
              user: userExisting,
              type: 'icon',
            });
            break;

          default:
            break;
        }

        const newMessage = await chatRoomMessageRepository.save(messageCreated);
        const socketIdSender = await redis.hget(
          REDIT_CHAT_ROOM_SOCKET_LIST,
          userExisting.userId,
        );
        const socketIdReceiver = await redis.hget(
          REDIT_CHAT_ROOM_SOCKET_LIST,
          receiverExisting.userId,
        );

        if (!socketIdReceiver && !socketIdSender)
          throw new Error('not found sender and receiver socket');

        if (socketIdReceiver) {
          //receiver have socketId(online)
          server
            .to(socketIdSender)
            .to(socketIdReceiver)
            .emit('server-send-message', newMessage);
        } else {
          server.to(socketIdSender).emit('server-send-message', newMessage);
        }
      }
      //Not have chat room______________________________________________________________________________
      else {
        const chatRoom = await chatRoomRepository
          .createQueryBuilder('chats-room')
          .select('chats-room')
          .where('chats-room.userOne.userId In(:...ids)', {
            ids: [userExisting.userId, receiverExisting.userId],
          })

          .andWhere('chats-room.userTwo.userId In(:...ids)', {
            ids: [userExisting.userId, receiverExisting.userId],
          })

          .leftJoinAndSelect('chats-room.userOne', 'userOne')
          .leftJoinAndSelect('chats-room.userTwo', 'userTwo')
          .getOne();

        if (chatRoom) throw new Error('chat room existed');

        const newChatRoom = await chatRoomRepository.save(
          chatRoomRepository.create({
            userOne: userExisting,
            userTwo: receiverExisting,
          }),
        );
        if (!newChatRoom) throw new Error('create chat room error');

        let messageCreated: ChatRoomMessage;
        switch (dto.type) {
          case 'text':
            messageCreated = chatRoomMessageRepository.create({
              content: dto.content,
              chatroom: chatRoom,
              user: userExisting,
              type: 'text',
            });
            break;
          case 'icon':
            messageCreated = chatRoomMessageRepository.create({
              content: dto.content,
              chatroom: chatRoom,
              user: userExisting,
              type: 'icon',
            });
            break;

          default:
            break;
        }

        const newMessage = await chatRoomMessageRepository.save(messageCreated);
        if (!newMessage) throw new Error('create chat room message error');

        const socketIdSender = await redis.hget(
          REDIT_CHAT_ROOM_SOCKET_LIST,
          userExisting.userId,
        );
        const socketIdReceiver = await redis.hget(
          REDIT_CHAT_ROOM_SOCKET_LIST,
          receiverExisting.userId,
        );

        if (!socketIdReceiver && !socketIdSender)
          throw new Error('not found sender and receiver socket');

        if (socketIdReceiver) {
          //receiver have socketId(online)
          server
            .to(socketIdSender)
            .to(socketIdReceiver)
            .emit('server-send-message', newMessage);
        } else {
          server.to(socketIdSender).emit('server-send-message', newMessage);
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
  //========================================================================================
  //   clientSendMedia
  //========================================================================================
  async clientSendMedia(
    dto: ClientSendImageChatRoomMessageDto,
    socket: Socket,
    redis: Redis,
    server: Server,
  ) {
    try {
      const mediaRepository = this.dataSource.getRepository(MediaMessage);
      const chatRoomRepository = this.dataSource.getRepository(Chatroom);
      const userRepository = this.dataSource.getRepository(User);
      const chatRoomMessageRepository =
        this.dataSource.getRepository(ChatRoomMessage);

      const token = socket.handshake.auth.token;

      const decoded = verify(
        token,
        this.config.get('ACCESS_TOKEN_SECRET'),
      ) as JwtPayload & { sub: string };

      if (!regexExp.test(decoded.sub)) {
        throw new Error('invalid uuid');
      }

      const senderExisting = await userRepository.findOne({
        where: {
          userId: decoded.sub,
        },
      });
      if (!senderExisting) throw new UnauthorizedException('user not found');
      const media = await this.mediaService.uploadFile(dto.media);
      if (media) {
        const newMedia = await mediaRepository.save(media);
        const chatRoom = await chatRoomRepository
          .createQueryBuilder('chats-room')
          .select('chats-room')
          .where('chats-room.userOne.userId In(:...ids)', {
            ids: [senderExisting.userId, dto.receiver.userId],
          })
          .andWhere('chats-room.userTwo.userId In(:...ids)', {
            ids: [senderExisting.userId, dto.receiver.userId],
          })
          .leftJoinAndSelect('chats-room.userOne', 'userOne')
          .leftJoinAndSelect('chats-room.userTwo', 'userTwo')
          .getOne();

        const socketIdSender = await redis.hget(
          REDIT_CHAT_ROOM_SOCKET_LIST,
          senderExisting.userId,
        );
        const socketIdReceiver = await redis.hget(
          REDIT_CHAT_ROOM_SOCKET_LIST,
          dto.receiver.userId,
        );

        if (chatRoom) {
          const newMessage = await chatRoomMessageRepository.save(
            chatRoomMessageRepository.create({
              type: 'image',
              media: newMedia,
              chatroom: chatRoom,
              user: senderExisting,
            }),
          );
          server
            .to(socketIdSender)
            .to(socketIdReceiver)
            .emit('server-send-media', { newMessage });
        } else {
          const newChatRoom = await chatRoomRepository.save(
            chatRoomRepository.create({
              userOne: senderExisting,
              userTwo: dto.receiver,
            }),
          );
          const newMessage = await chatRoomMessageRepository.save(
            chatRoomMessageRepository.create({
              type: 'image',
              media: newMedia,
              chatroom: newChatRoom,
              user: senderExisting,
            }),
          );
          server
            .to(socketIdSender)
            .to(socketIdReceiver)
            .emit('server-send-media', { newMessage });
        }
      }
    } catch (error) {
      this.logger.error('clientSendMedia', error);
    }
  }
  //========================================================================================
  //   clientUpdateMessageEmoji
  //========================================================================================
  async clientUpdateMessageEmoji(
    dto: ClientUpdateChatRoomMessageEmojiDto,
    server: Server,
    socket: Socket,
    redis: Redis,
  ) {
    try {
      if (!dto || !dto.emoji || !dto.message || !dto.receiver) {
        throw new Error('clienUpdateMessageEmoji not found');
      }
      const token = socket.handshake.auth.token;
      const userRepository = this.dataSource.getRepository(User);

      const decoded = verify(
        token,
        this.config.get('ACCESS_TOKEN_SECRET'),
      ) as JwtPayload & { sub: string };
      let senderExisting: User;

      if (!regexExp.test(decoded.sub)) {
        throw new Error('invalid uuid');
      }

      senderExisting = await userRepository.findOne({
        where: {
          userId: decoded.sub,
        },
      });
      if (!senderExisting) throw new UnauthorizedException('user not found');

      const chatRoomMessageRepository =
        this.dataSource.getRepository(ChatRoomMessage);
      const socketIdSender = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        senderExisting.userId,
      );
      const socketIdReceiver = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        dto.receiver.userId,
      );
      dto.message.emoji = dto.emoji;
      const updatedMessage = await chatRoomMessageRepository.save(dto.message);

      server
        .to(socketIdReceiver)
        .to(socketIdSender)
        .emit('server-update-chatroom-message-emoji', {
          updatedMessage,
        });
    } catch (error) {
      this.logger.error('clientUpdateMessageEmoji', error);
    }
  }
  //========================================================================================
  //   clientRemoveMessage
  //========================================================================================
  async clientRemoveMessage(
    dto: ClientDeleteChatRoomMessageDto,
    server: Server,
    socket: Socket,
    redis: Redis,
  ) {
    try {
      if (!dto || !dto.message || !dto.receiver) {
        throw new Error('clienUpdateMessageEmoji not found');
      }
      const token = socket.handshake.auth.token;
      const userRepository = this.dataSource.getRepository(User);

      const decoded = verify(
        token,
        this.config.get('ACCESS_TOKEN_SECRET'),
      ) as JwtPayload & { sub: string };
      let senderExisting: User;

      if (!regexExp.test(decoded.sub)) {
        throw new Error('invalid uuid');
      }

      senderExisting = await userRepository.findOne({
        where: {
          userId: decoded.sub,
        },
      });
      if (!senderExisting) throw new UnauthorizedException('user not found');

      const chatRoomMessageRepository = await this.dataSource.getRepository(
        ChatRoomMessage,
      );
      const socketIdSender = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        senderExisting.userId,
      );
      const socketIdReceiver = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        dto.receiver.userId,
      );
      dto.message.content = 'Message was removed';
      dto.message.type = 'removed';
      if (dto.message.emoji && dto.message.emoji.length > 1) {
        dto.message.emoji = '';
      }
      const updatedMessage = await chatRoomMessageRepository.save(dto.message);

      server
        .to(socketIdReceiver)
        .to(socketIdSender)
        .emit('server-remove-chatroom-message', {
          updatedMessage,
        });
    } catch (error) {
      this.logger.error('clientUpdateMessageEmoji', error);
    }
  }

  //========================================================================================
  //   getAllChatRoom
  //========================================================================================

  async getAllChatRoom(user: User): Promise<GetAllChatRoomDto> {
    try {
      const chatRoomRepository = this.dataSource.getRepository(Chatroom);
      const chatRoomMessageRepository =
        this.dataSource.getRepository(ChatRoomMessage);
      const chatRooms = await chatRoomRepository
        .createQueryBuilder('chats-room')
        .select('chats-room')

        .where('chats-room.userOne.userId=:id', {
          id: user.userId,
        })
        .orWhere('chats-room.userTwo.userId=:id', {
          id: user.userId,
        })
        .leftJoinAndSelect('chats-room.userOne', 'userOne')
        .leftJoinAndSelect('chats-room.userTwo', 'userTwo')
        .getMany();

      const result = await Promise.all(
        chatRooms.map(
          async (item) =>
            (item.chatRoomMessages = await chatRoomMessageRepository.find({
              where: {
                chatroom: {
                  chatroomId: item.chatroomId,
                },
              },
              take: 1,
              order: {
                timestamp: 'DESC',
              },
              relations: { chatroom: true },
            })),
        ),
      )
        .then(() => {
          return {
            code: responseCode.SUCCESS,
            success: true,
            chatRooms,
          };
        })
        .catch((err) => {
          this.logger.error(err);
          return {
            code: responseCode.INTERNAL_ERROR,
            success: false,
          };
        });

      return result;
    } catch (error) {
      this.logger.error(error);
      return {
        code: responseCode.INTERNAL_ERROR,
        success: false,
      };
    }
  }

  //========================================================================================
  //   clientSendCallVideoId
  //========================================================================================
  async clientRequestCallVideo(dto, redis: Redis, server: Server) {
    try {
      const peerId = dto.peerId;
      const receiver = dto.receiver as User;
      const sender = dto.sender as User;

      const socketIdReceiver = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        receiver.userId,
      );

      server.to(socketIdReceiver).emit('server-request-call-video', {
        sender,
        peerId,
        receiver,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  //========================================================================================
  //   clientSendEndCall
  //========================================================================================
  async clientSendEndCall(dto, redis: Redis, server: Server) {
    try {
      const socketIdReceiver = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        dto.receiver.userId,
      );
      server.to(socketIdReceiver).emit('server-send-end-call', {
        sender: dto.sender,
        receiver: dto.receiver,
        endCall: true,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  //========================================================================================
  //   clientSendAnswerCallVideo
  //========================================================================================
  async clientSendDeclineCallVideo(dto, redis: Redis, server: Server) {
    try {
      const receiver = dto.receiver as User;
      const sender = dto.sender as User;
      const isAccept = dto.isAccept;

      const socketIdSender = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        sender.userId,
      );
      server.to(socketIdSender).emit('server-send-decline-call-video', {
        receiver,
        isAccept,
        sender,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  //========================================================================================
  //   clientSendCallVideoStop
  //========================================================================================
  async clientSendCallVideoStop(
    dto: ClientSendStopCallVideo,
    redis: Redis,
    server: Server,
    socket: Socket,
  ) {
    try {
      const token = socket.handshake.auth.token;
      const userRepository = this.dataSource.getRepository(User);
      const chatRoomRepository = this.dataSource.getRepository(Chatroom);
      const chatRoomMessageRepository =
        this.dataSource.getRepository(ChatRoomMessage);

      const decoded = verify(
        token,
        this.config.get('ACCESS_TOKEN_SECRET'),
      ) as JwtPayload & { sub: string };
      let senderExisting: User;

      if (!regexExp.test(decoded.sub)) {
        throw new Error('invalid uuid');
      }

      senderExisting = await userRepository.findOne({
        where: {
          userId: decoded.sub,
        },
      });
      if (!senderExisting) throw new UnauthorizedException('user not found');

      const socketIdReceiver = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        dto.receiver.userId,
      );

      const socketIdSender = await redis.hget(
        REDIT_CHAT_ROOM_SOCKET_LIST,
        dto.sender.userId,
      );

      const chatRoom = await chatRoomRepository
        .createQueryBuilder('chats-room')
        .select('chats-room')
        .where('chats-room.userOne.userId In(:...ids)', {
          ids: [dto.sender.userId, dto.receiver.userId],
        })
        .andWhere('chats-room.userTwo.userId In(:...ids)', {
          ids: [dto.sender.userId, dto.receiver.userId],
        })
        .leftJoinAndSelect('chats-room.userOne', 'userOne')
        .leftJoinAndSelect('chats-room.userTwo', 'userTwo')
        .getOne();

      let newMessage: ChatRoomMessage;
      if (chatRoom) {
        newMessage = await chatRoomMessageRepository.save(
          chatRoomMessageRepository.create({
            content: dto.timing,
            type: 'call-video',
            user: senderExisting,
            chatroom: chatRoom,
          }),
        );
      } else {
        const newChatRoom = await chatRoomRepository.save(
          chatRoomRepository.create({
            userOne: dto.sender,
            userTwo: dto.receiver,
          }),
        );
        newMessage = await chatRoomMessageRepository.save(
          chatRoomMessageRepository.create({
            content: dto.timing,
            type: 'call-video',
            user: senderExisting,
            chatroom: newChatRoom,
          }),
        );
      }

      server
        .to(socketIdReceiver)
        .to(socketIdSender)
        .emit('server-send-call-video-stop', {
          newMessage,
          sender: dto.sender,
          receiver: dto.receiver,
        });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
