import { ArgsType, Field, InputType, ObjectType } from "@nestjs/graphql";
import { number } from "joi";
import { CoreOutput } from "src/common/dto/output.dto";

@InputType()
export class PagenationInput {
  @Field(type => Number, {defaultValue: 1})
  page: number;
}

@ObjectType()
export class PagenationOutput extends CoreOutput {
  @Field(type => Number, {nullable: true})
  totalPages?: number;

  @Field(type => Number, {nullable: true})
  totalItems?: number;
}