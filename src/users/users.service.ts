import { CreateAccountInput } from './dtos/create-user.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>
  ) {}

  async createAccount({email, password, role}: CreateAccountInput) {
    try {
      const userExists = await this.users.findOne({email});

      if(userExists) {
        return false;
      }

      const user = this.users.create({email, password, role});
      this.users.save(user);
      return true;
    } catch (error) {
      
    }
  }
}