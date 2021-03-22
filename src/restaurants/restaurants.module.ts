import { RestaurantService } from './restaurant.service';
import { Module } from '@nestjs/common';
import { CategoryResolver, DishResolver, RestaurantResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';
import {RestaurantRepository} from "./repositories/restaurant.repository";

@Module({
  imports: [TypeOrmModule.forFeature([
    RestaurantRepository,
    Dish,
    CategoryRepository
  ])],
  providers: [RestaurantResolver, CategoryResolver, DishResolver, RestaurantService]
})
export class RestaurantsModule {}