import { EditProfileInput } from './dtos/edit-profile.dto';
import { JwtService } from './../jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from './dtos/create-user.dto';
import { User } from "./entities/user.entity";
import { LoginInput } from './dtos/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwt: JwtService
  ) {}

  async createAccount({email, password, role}: CreateAccountInput): Promise<[boolean, string?]> {
    try {
      const userExists = await this.users.findOne({email});
      if(userExists) return [false, 'Account already exists.'];

      const user = this.users.create({email, password, role});
      this.users.save(user);
      return [true];
    } catch (error) {
      return [false, "Couldn't create user."];
    }
  }

  async login({email, password}: LoginInput): Promise<{ok: boolean, error?: string, token?: string }> {
    try {
      const user = await this.users.findOne({email});
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

  async findOne(id: number): Promise<User> {
    return this.users.findOne({ id });
  }

  async editProfile(id: number, {password, email}: EditProfileInput): Promise<User> {
    const user = await this.users.findOne(id);

    if (password) user.password = password; 
    if (email) user.email = email; 

    return this.users.save(user);
  }
}