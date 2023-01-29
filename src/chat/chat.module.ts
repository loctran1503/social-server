import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { JwtStrategy } from "../users/strategy";
import { ChatController } from "./chat.controller";
import { ChatGateWay } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { MediaService } from "./media.service";


@Module({
    imports:[JwtModule.register({}),
        ScheduleModule.forRoot()],
    providers:[ChatGateWay,ChatService,JwtStrategy,MediaService],
    controllers:[ChatController]
})
export class ChatModule{

}