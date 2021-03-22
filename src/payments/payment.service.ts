import {Injectable} from "@nestjs/common";
import {Payment} from "./entities/payment.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {LessThan, Repository} from "typeorm";
import {User} from "../users/entities/user.entity";
import {CreatePaymentInput, CreatePaymentOutput} from "./dto/create-payment.dto";
import {Restaurant} from "../restaurants/entities/restaurant.entity";
import {GetPaymentsOutput} from "./entities/get-payments.dto";
import {Interval} from "@nestjs/schedule";


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(owner: User, {restaurantId, transactionId}: CreatePaymentInput): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.'
        }
      }

      if(restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You cant do this.'
        }
      }

      const date = new Date();
      date.setDate(date.getDate() + 7);

      restaurant.isPromoted = true;
      restaurant.promotedUntil = date;
      await this.restaurants.save(restaurant);
      await this.payments.save(
        this.payments.create({
          transactionId,
          restaurant,
          user: owner
        })
      )

      return {
        ok: true
      }
    } catch (e) {
      console.log(e);
      return {ok: false, error: 'Cloud not create a transaction.'};
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({user: user});

      return {
        ok: true,
        payments
      }
    } catch (e) {
      return {
        ok: false,
        error: 'Cloud not get payments'
      }
    }
  }

  @Interval(5000)
  async checkPromotedRestaurants() {
    let restaurants = await this.restaurants.find({
      where: {
        isPromoted: true,
        promotedUntil: LessThan(new Date())
      }
    });

    console.log(restaurants);

    for (const restaurant of restaurants) {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    }
  }
}