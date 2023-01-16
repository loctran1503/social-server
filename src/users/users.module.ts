import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports:[JwtModule.register({})]
})
export class UsersModule {}
