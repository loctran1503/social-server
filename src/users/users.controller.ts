import { Body, Controller, Post, Req, Res, UseGuards,Get } from '@nestjs/common';
import { Request, Response } from 'express';
import {  UserLoginDto, UserSignUpDto } from './dto';
import { MessagePaginateDto } from './dto/messages.dto';
import { User } from './entities/user.entity';
import { JwtGuard } from './guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
    signUp(@Body() dto : UserSignUpDto,@Res({ passthrough: true }) response: Response){
        return this.usersService.signUp(dto,response)
    }

    @Post('login')
    login(@Body() dto : UserLoginDto,@Res({ passthrough: true }) response: Response){
        return this.usersService.login(dto,response)
    }

    @Get('checkAuth')
    checkAuth(@Req() request: Request,@Res({ passthrough: true }) response: Response){
        return this.usersService.checkAuth(request,response)
    }


    @Post('logout')
    @UseGuards(JwtGuard)
    logout(@Req() request : Request,@Res({ passthrough: true }) response: Response){
        return   this.usersService.logout(request.user as User,response)
    }



    @Post('get-all-user')
    getAllUser(@Body('userId') userId?:string){
        return  this.usersService.getAllUser(userId)
    }

    @Post('get-one-user')
    getOneUser(@Body('userId') userId:string){
        return  this.usersService.getOneUser(userId)
    }
    
    @Post('findAllCommunityMessage')
    findAllCommunityMessage(@Body() dto: MessagePaginateDto){
        return this.usersService.findAllCommunityMessage(dto)
    }


    @Post('me')
    @UseGuards(JwtGuard)
    me(@Req() req){
        
        return req.headers
    }
}
