import { Restaurant } from './restaurant.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { CoreEntity } from "src/common/core.entity";
import { Column, Entity, OneToMany } from "typeorm";

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(type => String)
  @Column({unique: true})
  @IsString()
  name: string;

  @Field(type => String)
  @Column({nullable: true})
  @IsString()
  coverImage: string;

  @Field(type => String)
  @Column({unique: true})
  @IsString()
  slug: string;

  @Field(type => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.category)
  restaurants: Restaurant []
}