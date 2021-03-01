import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dto/output.dto";
import { Dish } from "../entities/dish.entity";


@InputType()
export class EditDishInput extends PickType(
  PartialType(Dish),
  ['name', 'photo', 'price', 'options', 'description']
) {
  @Field(type => Number)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}