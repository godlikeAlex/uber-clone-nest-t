import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CreateOrderInput } from './dtos/create-order.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateDishOutput } from "src/restaurants/dtos/create-dish.dto";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orederItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>
  ) {}

  async createOrder(customer: User, {restaurantId, items}: CreateOrderInput): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return {
          ok: false,
          error: "Restaurant not found."
        }
      } 

      let orderFinalPrice: number = 0;
      const orderItems: OrderItem[] = [];
      
      for(const item of items) {
        const dish = await this.dishes.findOne(item.dishId);

        if (!dish) {
          return {
            ok: false,
            error: 'Dish not found.'
          }
        }

        let dishFinalPrice = dish.price;
        for(const itemOption of item.options) {
          const dishOption = dish.options.find(
            dishOptions => dishOptions.name === itemOption.name
          );


          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
            } else {
              const dishOptionChoise = dishOption.choises.find(
                optionChoise => optionChoise.name === itemOption.choise
              );

              if (dishOptionChoise) {
                if (dishOptionChoise.extra) {
                  dishFinalPrice += dishOptionChoise.extra;
                }
              }
            }
          }
        }
        orderFinalPrice += dishFinalPrice;

        const orderItem = await this.orederItems.save(this.orederItems.create({
          dish,
          options: item.options
        }));

        orderItems.push(orderItem);
      };

      await this.orders.save(this.orders.create({
        customer,
        restaurant,
        total: orderFinalPrice,
        items: orderItems
      }));

      return {
        ok: true
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Cloudnot create a order.'
      }
    }
  }
}