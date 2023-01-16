import { Body, Controller, Post, Req, Res, UseGuards,Get } from '@nestjs/common';
import { Request, Response } from 'express';
import {  UserLoginDto, UserSignUpDto } from './dto';
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
    logout(@Res({ passthrough: true }) response: Response){
        return this.usersService.logout(response)
    }


    @Post('me')
    @UseGuards(JwtGuard)
    me(@Req() req){
        
        return req.headers
    }
}
