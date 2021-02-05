import { CoreOutput } from './../../common/dto/output.dto';
import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";

@InputType()
export class CreateAccountInput extends PickType(User, ['email', 'password', 'role']) {};

@ObjectType()
export class CreateAccountOutPut extends CoreOutput {}