import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";


@Resolver(of => Order)
export class OrdersResolver {
  constructor(
    private readonly oredersService: OrdersService
  ) {}

  @Mutation(returns => CreateOrderOutput)
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    return ;
  }
}