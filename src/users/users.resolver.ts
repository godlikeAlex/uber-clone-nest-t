import { CreateAccountOutPut, CreateAccountInput } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from './entities/user.entity';

@Resolver(of => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Query(returns => Boolean)
  example(): boolean {
    return true;
  }

  @Mutation(returns => CreateAccountOutPut)
  createAccount(@Args('input') createAccountInput: CreateAccountInput) {}
}