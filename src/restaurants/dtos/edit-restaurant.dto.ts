import { CreateRestaurantInput } from './create-restaurant.dto';
import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dto/output.dto";

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(type => Number)
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}