import {  Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserComment } from "./user-comment.entity";


import { User } from "../../users/entities/user.entity";




@Entity('posts')
export class Post{
    @PrimaryGeneratedColumn('uuid')
    postId:string;

    
    @ManyToOne(() => User, (user) => user.posts)
    user: User


    @Column("simple-json")
    content:any

    @Column("simple-array",{nullable:true})
    medias?:string[]

    @OneToMany(() => UserComment, (comment) => comment.post)
    userComments?: UserComment[]



    @CreateDateColumn({ type: 'timestamptz'})
    createdAt:Date 
}