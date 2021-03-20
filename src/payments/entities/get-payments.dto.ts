import {Field, ObjectType} from "@nestjs/graphql";
import {CoreOutput} from "../../common/dto/output.dto";
import {Payment} from "./payment.entity";


@ObjectType()
export class GetPaymentsOutput extends CoreOutput {
  @Field(type => [Payment], {nullable: true})
  payments?: Payment[];
}