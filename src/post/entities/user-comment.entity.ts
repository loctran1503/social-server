import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./post.entity";
import { User } from "../../users/entities/user.entity";


@Entity('userComment')
export class UserComment{
    @PrimaryGeneratedColumn('uuid')
    userCommentId:string;

    @ManyToOne(() => User, (user) => user.userComments)
    user: User

    @Column()
    contents:string

    @Column({nullable:true})
    media?:string

    @ManyToOne(() => Post, (post) => post.userComments)
    post: Post



    @CreateDateColumn({ type: 'timestamptz'})
    createdAt:Date  
}