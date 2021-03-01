import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from 'src/common/core.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';

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

  @Field(type => String)
  @Column()
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
}