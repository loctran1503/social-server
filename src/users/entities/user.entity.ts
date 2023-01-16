
import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,BeforeInsert} from 'typeorm'
import * as bcrypt from 'bcrypt';

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

    @BeforeInsert()
    async hashPassword(){
        const salt = await bcrypt.genSalt()
        this.firebaseId = await bcrypt.hash(this.firebaseId,salt)
    }

    

}