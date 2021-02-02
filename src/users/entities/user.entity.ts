import { CoreEntity } from './../../common/core.entity';
import { BeforeInsert, Column, Entity } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, isEmail, IsEnum, IsString, Length } from 'class-validator';

enum UserRole {
  Client,
  Owner,
  Delivery
}

registerEnumType(UserRole, {name: 'UserRole'});
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(type => String)
  @IsString()
  @Length(7)
  password: string;

  @Column({type: 'enum', enum: UserRole})
  @Field(type => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();    
    }    
  }
}