import { UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { JwtService } from './../jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Verification } from './entities/verification.entity';
import { CreateAccountInput, CreateAccountOutPut } from './dtos/create-user.dto';
import { User } from "./entities/user.entity";
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { VerifyOutput } from './dtos/verify.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification) private readonly verification: Repository<Verification>,
    private readonly configService: ConfigService,
    private readonly jwt: JwtService
  ) {}

  async createAccount({email, password, role}: CreateAccountInput): Promise<CreateAccountOutPut> {
    try {
      const userExists = await this.users.findOne({email});
      if(userExists) throw new Error('Account already exists.');

      const user = this.users.create({email, password, role});
      await this.users.save(user);

      await this.verification.save(
        this.verification.create({
          user
        })
      );

      return {ok: true};
    } catch (error) {
      return {ok: false, error};
    }
  }

  async login({email, password}: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({email}, {select: ['id', 'password']});
      if (!user) return {ok: false, error: `User with email: ${email} not found.`};

      const passwordCompared = await user.comparePassword(password);
      if(!passwordCompared) return {ok: false, error: 'Password not match.'}
      const token = this.jwt.sign(user.id);
      return {
        ok: true,
        token
      }
    } catch (error) {
      console.log(error);
      return {ok: false, error};
    }
  }

  async findOne(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ id });
      if (!user) throw new Error('User not found');

      return {ok: true, user};
    } catch (error) {
      return {ok: false, error};
    }
  }

  async editProfile(id: number, {password, email}: EditProfileInput): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(id);

      if (password) user.password = password; 
      if (email) {
        user.email = email;
        await this.verification.save(
          this.verification.create({
            user
          })
        );
      } 
  
      await this.users.save(user);
  
      return {ok: true};
    } catch (error) {
      return {ok: false, error};
    }
  }

  async verifyEmail(code: string): Promise<VerifyOutput> {
    try {
      const verification = await this.verification.findOne({code}, {relations: ['user']});

      if (verification) {
        verification.user.verified = true;
        this.users.save(verification.user);
        return {ok: true};
      }
  
      return {ok: false};
    } catch (error) {
      return {ok: false, error};
    }
  }
}