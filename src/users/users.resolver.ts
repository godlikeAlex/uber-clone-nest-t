import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { AuthGuard } from './../auth/auth.guard';
import { CreateAccountOutPut, CreateAccountInput } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { Args, Context, InputType, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { VerifyInput, VerifyOutput } from './dtos/verify.dto';
import { Role } from 'src/auth/role.decorator';

@Resolver(of => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Query(returns => User)
  @Role(['Any'])
  me(
    @AuthUser() user: User
  ) {
    return user;
  }

  @Role(['Any'])
  @Query(returns => UserProfileOutput)
  async userProfile(
    @Args() {userId}: UserProfileInput
  ): Promise<UserProfileOutput> {
    return this.usersService.findOne(userId);
  }

  @Mutation(returns => CreateAccountOutPut)
  async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutPut> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(returns => LoginOutput)
  async login(
    @Args('input') loginInput: LoginInput
  ): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Role(['Any'])
  @Mutation(returns => EditProfileOutput)
  async editProfile(
    @AuthUser() user: User,
    @Args('input') editProfileInput: EditProfileInput
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(user.id, editProfileInput);
  }

  @Mutation(returns => VerifyOutput)
  async verifyEmail(
    @Args('input') verifyInput: VerifyInput
  ): Promise<VerifyOutput> {
    return this.usersService.verifyEmail(verifyInput.code);
  }

}