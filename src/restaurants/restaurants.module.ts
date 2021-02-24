import { RestaurantService } from './restaurant.service';
import { Module } from '@nestjs/common';
import { CategoryResolver, RestaurantResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    Restaurant,
    CategoryRepository
  ])],
  providers: [RestaurantResolver, CategoryResolver, RestaurantService]
})
export class RestaurantsModule {}