import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurantRepository.create({
        ...createRestaurantInput, owner
      });

      const categoryName = createRestaurantInput.categoryName.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categoryRepository.findOne({ slug: categorySlug });

      if (!category) {
        category = await this.categoryRepository.save(
          this.categoryRepository.create({name: categoryName, slug: categorySlug})
        );
      }
      
      newRestaurant.category = category;

      await this.restaurantRepository.save(newRestaurant);

      return {ok: true};
    } catch (error) {
      return {
        ok: false,
        error: 'Clould not create a restaurant'
      }
    }
  }
}