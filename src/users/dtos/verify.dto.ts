import { Verification } from './../entities/verification.entity';
import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dto/output.dto";

@ObjectType()
export class VerifyOutput extends CoreOutput {};

@InputType()
export class VerifyInput extends PickType(Verification, ['code']) {};