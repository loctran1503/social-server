import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { Request, Response } from 'express';
import { UserLoginDto, UserResponse, UserSignUpDto } from './dto';
import { User } from './entities/user.entity';
import { responseCode } from 'src/util/constants';
import { DefaultResponse } from 'src/util/types';
import { JwtPayload, Secret, verify } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly config: ConfigService,
    private jwt: JwtService,
    private dataSource: DataSource,
  ) {}

  // *************************************************************************************************************
  // signup
  // *************************************************************************************************************
  async signUp(
    { firebaseId, name, avatar, email }: UserSignUpDto,
    res: Response,
  ): Promise<UserResponse> {
    try {
      const userRepository = this.dataSource.getRepository(User);
      const userExisting = await userRepository.findOne({
        where: {
          firebaseId,
        },
      });
      if (userExisting) {
        return {
          code: responseCode.ALREADY_EXIST,
          success: false,
          message: 'User already exist',
        };
      } else {
        const user = userRepository.create({
          firebaseId: firebaseId,
          name,
          avatar,
          email,
        });

        const newUser = await userRepository.save(user);

        await this.setCookie(newUser.userId, res);
        return {
          code: responseCode.SUCCESS,
          success: true,
          accessToken: await this.signToken(newUser.userId, 'access'),
          user: newUser,
        };
      }
    } catch (error) {
      this.logger.error(`signup trycatch error`);
      this.logger.error(error);
      return {
        code: responseCode.INTERNAL_ERROR,
        success: false,
        message: `Server Internal Error`,
      };
    }
  }

  // *************************************************************************************************************
  // login
  // *************************************************************************************************************
  async login(
    { firebaseId, email }: UserLoginDto,
    res: Response,
  ): Promise<UserResponse> {
    try {
      const userRepository = await this.dataSource.getRepository(User);
      const userExisting = await userRepository.findOne({
        where: {
          email,
        },
      });
      if (!userExisting) {
        return {
          code: responseCode.NOT_FOUND,
          success: false,
          message: 'User not found',
        };
      } else {
        const isValid = await bcrypt.compare(
          firebaseId,
          userExisting.firebaseId,
        );
        if (!isValid)
          return {
            code: responseCode.INVALID,
            success: false,
            message: 'FirebaseId Not Valid',
          };
        await this.setCookie(userExisting.userId, res);
        const token = await this.signToken(userExisting.userId, 'access');
 
        
        return {
          code: responseCode.SUCCESS,
          success: true,
          message: 'Login Successfully!',
          accessToken: token,
          user: userExisting,
        };
      }
    } catch (error) {
      this.logger.error(`login trycatch error`);
      this.logger.error(error);
      return {
        code: 500,
        success: false,
        message: `Server Internal Error`,
      };
    }
  }

  // *************************************************************************************************************
  // logout
  // *************************************************************************************************************
  logout(response: Response): DefaultResponse {
    try {
      
      console.log(`logout:${this.config.get('COOKIE_PATH')}`);
   
        response.clearCookie(this.config.get('COOKIE_NAME'), {
          httpOnly: true,
          secure: this.config.get('NODE_ENV') === 'production',
          sameSite: 'lax',
          path: this.config.get('COOKIE_PATH'),
          maxAge:86400000
        });
    

      return {
        success: true,
        code: 200,
        message: 'Log out successfully!',
      };
    } catch (error) {
      this.logger.error(`logout trycatch error`);
      this.logger.error(error);

      return {
        code: 500,
        success: false,
      };
    }
  }

  // *************************************************************************************************************
  // checkAuth
  // *************************************************************************************************************
  async checkAuth(request: Request, response: Response): Promise<UserResponse> {
    try {
      const refresh_token = request.cookies[this.config.get('COOKIE_NAME')];
      if (!refresh_token)
        return {
          code: responseCode.NOT_FOUND,
          success: false,
          message: 'Not found cookie',
        };
      const decoded = verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET as Secret,
      ) as JwtPayload & {
        sub: string;
      };
      if (!decoded)
        return {
          code: responseCode.INVALID,
          success: false,
          message: 'Refresh Token invalid',
        };
      const userExisting = await this.dataSource.getRepository(User).findOne({
        where: {
          userId: decoded.sub,
        },
      });
      if (!userExisting)
        return {
          code: responseCode.NOT_FOUND,
          success: false,
          message: 'User not found',
        };
      await this.setCookie(userExisting.userId, response);
      return {
        code: 200,
        success: true,
        user: userExisting,
        accessToken: await this.signToken(userExisting.userId, 'access'),
        message: 'Authenticated',
      };
    } catch (error) {
      this.logger.error(`checkAuth trycatch error`);
      this.logger.error(error);

      return {
        code: 500,
        success: false,
        message: `Server Internal Error`,
      };
    }
  }

  //========================================================================================
  //   Util
  //========================================================================================
  async setCookie(userId: string, res: Response) {
    console.log(`checkAuth:${this.config.get('COOKIE_PATH')}`);
    
    const refresh_token = await this.signToken(userId, 'refresh');
    res.cookie(this.config.get('COOKIE_NAME'), refresh_token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: this.config.get('COOKIE_PATH'),
      maxAge:86400000 //1day
    });
  }
  signToken(userId: string, type: 'access' | 'refresh'): Promise<string> {
    try {
      const payload = {
        sub: userId,
      };
      return type === 'access'
        ? //Access Token
          this.jwt.signAsync(payload, {
            expiresIn: '1days',
            secret: this.config.get('ACCESS_TOKEN_SECRET'),
          })
        : //Reresh Token
          this.jwt.signAsync(payload, {
            expiresIn: '10days',
            secret: this.config.get('REFRESH_TOKEN_SECRET'),
          });
    } catch (error) {
      this.logger.error('signToken trycatch error');
      this.logger.error(error);
      throw error;
    }
  }
}
