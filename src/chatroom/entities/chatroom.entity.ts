import { User } from "../../users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChatRoomMessage } from "./chatroom-message.entity";

@Entity('chats-room')
export class Chatroom {
    @PrimaryGeneratedColumn('uuid')
    chatroomId:string;



    @ManyToOne(() => User,user => user.chatrooms,{nullable:false})
    userOne:User

 
    @ManyToOne(() => User,user => user.chatrooms,{nullable:false})
    userTwo:User

    @OneToMany(() => ChatRoomMessage,message => message.chatroom)
    chatRoomMessages:ChatRoomMessage[]

    
}
