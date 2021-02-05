import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { AuthGuards } from './../auth/auth.guard';
import { CreateAccountOutPut, CreateAccountInput } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { Args, Context, InputType, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';

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

  @Query(returns => User)
  @UseGuards(AuthGuards)
  me(
    @AuthUser() user: User
  ) {
    return user;
  }

  @Query(returns => UserProfileOutput)
  async userProfile(
    @Args() {userId}: UserProfileInput
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findOne(userId);
      
      if (!user) throw Error('User not found');

      return {
        ok: true,
        error: null,
        user,
      }
    } catch (error) {
      return {ok: false, error};
    }
  }

  @UseGuards(AuthGuards)
  @Mutation(returns => EditProfileOutput)
  async editProfile(
    @AuthUser() user: User,
    @Args('input') editProfileInput: EditProfileInput
  ): Promise<EditProfileOutput> {
    try {
      await this.usersService.editProfile(user.id, editProfileInput);
      return {
        ok: true,
        error: null
      }
    } catch (error) {
      return {ok: false, error}
    }
  }
}