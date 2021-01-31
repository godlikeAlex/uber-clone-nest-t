import { UpdateRestaurantDto } from './dtos/update-restaurant-dto';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>
  ) {}

  create() {
    console.log(true);
  }

  findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }

  createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const newRestaurant = this.restaurantRepository.create(createRestaurantDto);
    return this.restaurantRepository.save(newRestaurant);
  }

  async updateRestaurant({id, data}: UpdateRestaurantDto) {
    const restaurant = await this.restaurantRepository.findOne(id);

    if (!restaurant) throw new Error('Restaurant not found!');

    return this.restaurantRepository.update(restaurant, {...data});
  }
}