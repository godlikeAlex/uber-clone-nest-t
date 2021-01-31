import { RestaurantService } from './restaurant.service';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant-dto';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  constructor (
    private readonly restaurantService: RestaurantService
  ) {}
  @Query(returns => [Restaurant])
  restaurants(
    // @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantDto
  ): Promise<Restaurant[]> {
    return this.restaurantService.findAll();
  }

  @Mutation(returns => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantDto: CreateRestaurantDto
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(
    @Args() updateRestaurantDto: UpdateRestaurantDto
  ): Promise<Boolean> {
    return true;
  }
}
