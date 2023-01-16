import { IsEmail, IsNotEmpty } from "class-validator";
import { DefaultResponse } from "src/util/types";
import { User } from "../entities/user.entity";


export class UserSignUpDto{
    @IsNotEmpty()
    firebaseId:string;
    @IsNotEmpty()
    avatar:string;
    @IsNotEmpty()
    name:string;
    @IsNotEmpty()
    @IsEmail()
    email:string;
}

export class UserLoginDto{
    @IsNotEmpty()
    @IsEmail()
    email:string
    @IsNotEmpty()
    firebaseId:string
}

// Response
export interface UserResponse extends DefaultResponse{
    user?:User;
    accessToken?:string
}

