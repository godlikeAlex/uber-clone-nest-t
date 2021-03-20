import {Args, Mutation, Resolver, Query} from "@nestjs/graphql";
import {Payment} from "./entities/payment.entity";
import {CreatePaymentInput, CreatePaymentOutput} from "./dto/create-payment.dto";
import {PaymentService} from "./payment.service";
import {AuthUser} from "../auth/auth-user.decorator";
import {User} from "../users/entities/user.entity";
import {Role} from "../auth/role.decorator";
import {GetPaymentsOutput} from "./entities/get-payments.dto";


@Resolver(of => Payment)
export class PaymentResolver {
  constructor(
    private readonly paymentService: PaymentService
  ) {}

  @Mutation(returns => CreatePaymentOutput)
  @Role(['Owner'])
  async createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }

  @Query(returns => GetPaymentsOutput)
  @Role(['Owner'])
  async getPayments(
    @AuthUser() user: User
  ): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayments(user);
  }
}