import { Dish } from './dish.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/core.entity";
import { Category } from "./category.entity";
import { User } from "src/users/entities/user.entity";
import { Order } from 'src/orders/entities/order.entity';
@InputType("RestaurantInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(type => String)
  @Column()
  @IsString()
  @Length(4, 15)
  name: String;

  @Field(type => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(4, 15)
  address: string;

  @Field(type => Category, {nullable: true})
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    {nullable: true, onDelete: 'SET NULL'}
  )
  category: Category;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user =>  user.restaurants,
    {onDelete: 'CASCADE'}
  )
  owner: User;

  @Field(type => [Order])
  @OneToMany(
    type => Order,
    order => order.restaurant
  )
  orders: Order[];

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;


  @Field(type => [Dish])
  @OneToMany(type => Dish, dish => dish.restaurant)
  menu: Dish[];

  @Field(type => Boolean)
  @Column({default: false})
  isPromoted: boolean;

  @Field(type => Date, {nullable: true})
  @Column({nullable: true})
  promotedUntil: Date;
}