import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn, ManyToOne} from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity({name:'media-messages'})
export class MediaMessage{
    @PrimaryGeneratedColumn("uuid")
    mediaId:string

    @Column()
    key:string

    @Column()
    mimeType:string

    @Column()
    size:number

    @Column()
    location:string

    @CreateDateColumn()
    createdAt:Date
}