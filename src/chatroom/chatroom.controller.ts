import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { User } from "../users/entities/user.entity";
import { responseCode } from "src/util/constants";
import { JwtGuard } from "../users/guard";
import { ChatroomService } from "./chatroom.service";


@Controller('chat-room')
export class ChatroomController{
 constructor(private chatroomService : ChatroomService){}

 @Post('get-one')
 @UseGuards(JwtGuard)
 async getChatRoom(@Body() {userId} : {userId:string},@Req() req : Request ){
    return await this.chatroomService.getChatRoom(userId,req.user as User)
 }

 @Post('get-all')
 @UseGuards(JwtGuard)
 async getAllChatRoom(@Req() req : Request ){
    return await this.chatroomService.getAllChatRoom(req.user as User)
 }

 @Post('is-seen')
 @UseGuards(JwtGuard)
 async setIsSeen(@Req() req : Request,@Body('receiver') receiver : User ){
    return await this.chatroomService.setIsSeen(req.user as User,receiver)
 }


}