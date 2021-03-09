import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CreateOrderInput } from './dtos/create-order.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateDishOutput } from "src/restaurants/dtos/create-dish.dto";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { User, UserRole } from 'src/users/entities/user.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import {GetOrderInput, GetOrderOutput} from "./dtos/get-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
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

        const orderItem = await this.orderItems.save(this.orderItems.create({
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

  async getOrders(user: User, {status}: GetOrdersInput): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({where: {
          customer: user,
          ...(status && {status})
        }});   
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({where: {
          driver: user,
          ...(status && {status})
        }});   
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user
          },
          relations: ['orders']
        });   
  
        orders = restaurants.map(restaurant => restaurant.orders).flat(1);
        if(status) {
          orders = orders.filter(order => order.status === status);
        }
      }
      return {
        ok: true,
        orders
      }
    } catch (error) {
      return {
        ok: false,
        error: "Cloudnot get orders."
      }
    }
  }

  async getOrder(user: User, {id}: GetOrderInput): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(id, {relations: ['restaurant']});

      if (!order) {
        return {
          ok: false,
          error: 'Order not found'
        }
      }

      if (
        order.customerId !== user.id &&
        order.driverId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return {
          ok: false,
          error: "You cant see that."
        }
      }

      return {
        ok: true,
        order
      }
    } catch (e) {
      return {
        ok: false,
        error: "Cloud not load order."
      }
    }
  }
}