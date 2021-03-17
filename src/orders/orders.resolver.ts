import { GetOrdersOutput, GetOrdersInput } from './dtos/get-orders.dto';
import {Args, Mutation, Resolver, Query, Subscription} from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";
import {GetOrderInput, GetOrderOutput} from "./dtos/get-order.dto";
import {EditOrderInput, EditOrderOutput} from "./dtos/edit-order.dto";
import {PubSub} from "graphql-subscriptions";
import {Inject} from "@nestjs/common";
import {NEW_PENDING_ORDER, PUB_SUB} from "../common/common.constants";

@Resolver(of => Order)
export class OrdersResolver {
  constructor(
    private readonly oredersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
  ) {}

  @Mutation(returns => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    return this.oredersService.createOrder(customer, createOrderInput);
  }

  @Query(returns => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput
  ): Promise<GetOrdersOutput> {
    return this.oredersService.getOrders(user, getOrdersInput);
  }

  @Query(returns => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput
  ): Promise<GetOrderOutput> {
    return this.oredersService.getOrder(user, getOrderInput);
  }

  @Mutation(returns => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput
  ): Promise<EditOrderOutput> {
    return this.oredersService.editOrder(user, editOrderInput);
  }

  @Subscription(returns => Order, {
    filter: ({pendingOrder: {ownerId}}, _, {user}) => {
      return ownerId === user.id;
    },
    resolve: payload => payload.pendingOrder.order
  })
  @Role(['Owner'])
  pendingOrder() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }
}