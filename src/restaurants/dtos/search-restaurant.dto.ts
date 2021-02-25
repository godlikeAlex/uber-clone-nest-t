import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { PagenationInput, PagenationOutput } from "./pagination.dto";

@InputType()
export class SearchRestaurantInput extends PagenationInput {
  @Field(type => String)
  query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PagenationOutput {
  @Field(type => [Restaurant], {nullable: true})
  restaurants?: Restaurant[];
}