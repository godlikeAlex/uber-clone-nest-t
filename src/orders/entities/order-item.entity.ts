import { CoreEntity } from 'src/common/core.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { Dish, DishChoise } from 'src/restaurants/entities/dish.entity';
import { DishOption } from '../../restaurants/entities/dish.entity';

@InputType('OrderItemOptionInputType', {isAbstract: true})
@ObjectType()
export class OrderItemOption {
  @Field(type => String)
  name?: string;

  @Field(type => String, {nullable: true})
  choise?: string;
}

@InputType('OrderItemInputType')
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(type => Dish, {nullable: true})
  @ManyToOne(type => Dish, {nullable: true, onDelete: 'CASCADE'})
  dish?: Dish;

  @Field(type => [OrderItemOption], {nullable: true})
  @Column({type: 'json', nullable: true})
  options?: OrderItemOption[]
}