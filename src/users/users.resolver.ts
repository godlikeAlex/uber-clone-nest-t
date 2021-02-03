import { CreateAccountOutPut, CreateAccountInput } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';

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
  async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutPut> {
    try {
      const [ok, error] = await this.usersService.createAccount(createAccountInput);

      return {ok, error};
    } catch (error) {
      return {ok: false, error};
    }
  }

  @Mutation(returns => LoginOutput)
  async login(
    @Args('input') loginInput: LoginInput
  ): Promise<LoginOutput> {
    try {
      return await this.usersService.login(loginInput);
    } catch (error) {
      return {ok: false, error};
    }
  }
}