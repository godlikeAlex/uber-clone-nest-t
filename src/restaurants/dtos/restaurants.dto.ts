import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { PagenationInput, PagenationOutput } from "./pagination.dto";

@InputType()
export class RestaurantsInput extends PagenationInput {}

@ObjectType()
export class RestaurantsOutput extends PagenationOutput {
  @Field(type => [Restaurant], {nullable: true})
  results?: Restaurant[];
}