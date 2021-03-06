import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from 'src/common/core.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
@InputType('DishChoiseInputType')
@ObjectType()
export class DishChoise {
  @Field(type => String)
  name: string;

  @Field(type => Number, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', {isAbstract: true})
@ObjectType()
export class DishOption {
  @Field(type => String)
  name?: string;

  @Field(type => [DishChoise], {nullable: true})
  choises?: DishChoise[];

  @Field(type => Number, {nullable: true})
  extra?: number;
}
@InputType('DishInputType', {isAbstract: true})
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(type => String)
  @Length(3)
  @Column()
  @IsString()
  name: string;

  @Field(type => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(type => String, {nullable: true})
  @Column({nullable: true})
  @IsString()
  photo: string;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(10, 150)
  description: string;

  @Field(type => Restaurant)
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.menu,
    {nullable: true, onDelete: 'CASCADE'}
  )
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(type => [DishOption], {nullable: true})
  @Column({type: 'json', nullable: true})
  options?: DishOption[]
}