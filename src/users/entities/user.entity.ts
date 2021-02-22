import { CoreEntity } from './../../common/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, isEmail, IsEnum, IsString, Length } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery'
}

registerEnumType(UserRole, {name: 'UserRole'});
@InputType("UserInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({unique: true})
  @Field(type => String)
  @IsEmail()
  email: string;

  @Column({select: false})
  @Field(type => String)
  @IsString()
  @Length(7)
  password: string;

  @Column({type: 'enum', enum: UserRole})
  @Field(type => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({default: false})
  @Field(type => Boolean)
  verified: boolean;

  @Field(type => [Restaurant])
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.owner
  )
  restaurants: Restaurant[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();    
      }
    }
  }

  async comparePassword(iPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(iPassword, this.password);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();    
    }
  }
}