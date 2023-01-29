
import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,BeforeInsert, OneToMany} from 'typeorm'
import * as bcrypt from 'bcrypt';
import { Post } from '../../post/entities/post.entity';
import { UserComment } from '../../post/entities/user-comment.entity';
import { CommunityMessage } from '../../chat/entities/community-message.entity';
import { Chatroom } from '../../chatroom/entities/chatroom.entity';
import { ChatRoomMessage } from '../../chatroom/entities/chatroom-message.entity';

@Entity({name:'users'})
export class User{
    @PrimaryGeneratedColumn("uuid")
    userId:string

    @Column()
    firebaseId:string

    @Column({unique:true})
    email:string

    @Column()  
    name:string

    @Column()
    avatar:string

    @CreateDateColumn()
    createdAt:Date

    @Column({default:false})
    isOnline:boolean

    
    @OneToMany(() => Post, (post) => post.user,{nullable:true})
    posts?: Post[]

    @OneToMany(() => ChatRoomMessage,message => message.user)
    chatRoomMessages:ChatRoomMessage[]

    @OneToMany(() => Chatroom,null,{nullable:true})
    chatrooms?: Chatroom[]

    @OneToMany(() => UserComment, (comment) => comment.user,{nullable:true})
    userComments?: UserComment[]

    @OneToMany(() => CommunityMessage, (comment) => comment.user,{nullable:true})
    communityMessage?: CommunityMessage[]

    @BeforeInsert()
    async hashPassword(){
        const salt = await bcrypt.genSalt()
        this.firebaseId = await bcrypt.hash(this.firebaseId,salt)
    }

    

}