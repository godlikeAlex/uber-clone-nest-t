import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dto/output.dto";
import { Order } from "../entities/order.entity";


@InputType()
export class CreateOrderInput extends PickType(Order, ['items']) {
  @Field(type => Number)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}