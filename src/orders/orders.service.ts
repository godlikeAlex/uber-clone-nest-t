import {GetOrdersInput, GetOrdersOutput} from './dtos/get-orders.dto';
import {Restaurant} from 'src/restaurants/entities/restaurant.entity';
import {CreateOrderInput} from './dtos/create-order.dto';
import {Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {CreateDishOutput} from "src/restaurants/dtos/create-dish.dto";
import {Repository} from "typeorm";
import {Order, OrderStatus} from "./entities/order.entity";
import {User, UserRole} from 'src/users/entities/user.entity';
import {OrderItem} from './entities/order-item.entity';
import {Dish} from 'src/restaurants/entities/dish.entity';
import {GetOrderInput, GetOrderOutput} from "./dtos/get-order.dto";
import {EditOrderInput, EditOrderOutput} from "./dtos/edit-order.dto";
import {NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB} from "../common/common.constants";
import {PubSub} from "graphql-subscriptions";

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
    private readonly restaurants: Repository<Restaurant>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
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

      const order = await this.orders.save(this.orders.create({
        customer,
        restaurant,
        total: orderFinalPrice,
        items: orderItems
      }));

      await this.pubSub.publish(NEW_PENDING_ORDER, { pendingOrder: {order, ownerId: restaurant.ownerId} });

      return {
        ok: true
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Cloud not create a order.'
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
        error: "Cloud not get orders."
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

      if (!this.canSeeOrder(user, order)) {
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

  async editOrder(user: User, {id, status}: EditOrderInput): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(id);

      if (!order) {
        return {
          ok: false,
          error: 'Order not found.'
        }
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'You cant see it'
        }
      }
      let canEdit = true;
      if (user.role === UserRole.Client) canEdit = false;

      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) canEdit = false;
      }

      if (user.role === UserRole.Delivery) {
        if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) canEdit = false;
      }

      if (!canEdit) {
        return {
          ok: false,
          error: "You can't do that."
        }
      }

      await this.orders.save({
        id,
        status
      });

      const newOrder = {...order, status};

      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          await this.pubSub.publish(NEW_COOKED_ORDER, {cookedOrders: newOrder});
        }
      }

      await this.pubSub.publish(NEW_ORDER_UPDATE, {orderUpdates: newOrder});

      return {
        ok: true
      }

    } catch (e) {
      return {
        ok: false,
        error: "Cloud not update order"
      }
    }
  }

  private canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;

    if(user.role === UserRole.Client && order.customerId !== user.id) canSee = false;
    if(user.role === UserRole.Delivery && order.driverId !== user.id) canSee = false;
    if(user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) canSee = false;

    return canSee;
  }
}