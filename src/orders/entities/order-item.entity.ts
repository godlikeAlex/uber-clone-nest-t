import { CoreEntity } from 'src/common/core.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { Dish } from 'src/restaurants/entities/dish.entity';
import { DishOption } from '../../restaurants/entities/dish.entity';

@InputType('OrderItemInputType')
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @ManyToOne(type => Dish, {nullable: true, onDelete: 'CASCADE'})
  dish?: Dish;

  @Field(type => [DishOption], {nullable: true})
  @Column({type: 'json', nullable: true})
  options?: DishOption[]
}