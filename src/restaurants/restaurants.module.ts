import { RestaurantService } from './restaurant.service';
import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.reolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Restaurant,
    Category
  ])],
  providers: [RestaurantResolver, RestaurantService]
})
export class RestaurantsModule {}