import { PagenationInput, PagenationOutput } from './pagination.dto';
import { ArgsType, Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dto/output.dto";
import { Category } from "../entities/category.entity";

@InputType()
export class CategoryInput extends PagenationInput {
  @Field(type => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PagenationOutput {
  @Field(type => Category, {nullable: true})
  category?: Category;
}