import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

@ObjectType()
@Entity()
export class Restaurant {
  @Field(type => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(4, 15)
  name: String;

  @Field(type => Boolean, {defaultValue: false})
  @Column({default: false})
  @IsOptional()
  @IsBoolean()
  isVegan: boolean;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(4, 15)
  address: string;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(4, 15)
  ownerName: string;
}