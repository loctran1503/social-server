import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './db/data-source';
import { UsersModule } from './users/users.module';
import { PostModule } from './post/post.module';
import { ChatModule } from './chat/chat.module';

import { redisModule } from './redis/redis.config';
import { ChatroomModule } from './chatroom/chatroom.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),TypeOrmModule.forRootAsync(dataSourceOptions), UsersModule, PostModule,ChatModule,
  redisModule,
  ChatroomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
