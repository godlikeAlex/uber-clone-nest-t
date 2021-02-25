import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit-restaurant.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from './repositories/category.repository';
import { CoreOutput } from 'src/common/dto/output.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryRepository: CategoryRepository
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurantRepository.create({
        ...createRestaurantInput, owner
      });
     
      newRestaurant.category = await this.categoryRepository.getOrCreate(
        createRestaurantInput.categoryName
      );

      await this.restaurantRepository.save(newRestaurant);

      return {ok: true};
    } catch (error) {
      return {
        ok: false,
        error: 'Clould not create a restaurant'
      }
    }
  }

  async editRestaurant(
    owner: User, 
    editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    try {
      const verifyError = await this.getRestaurantIsItOwner(owner, editRestaurantInput.restaurantId);
      
      if (verifyError) return verifyError;

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categoryRepository.getOrCreate(editRestaurantInput.categoryName);
      }

      await this.restaurantRepository.save([{
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && { category })
      }]);

      return {
        ok: true
      };
    } catch (error) {
      return {ok: false, error: 'Cloud not create restaurant'}
    }  
  }

  async deleteRestaurant(
    owner: User, 
    {restaurantId}: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> { 
    try {
      const verifyError = await this.getRestaurantIsItOwner(owner, restaurantId);
      
      if (verifyError) return verifyError;
      
      await this.restaurantRepository.delete(restaurantId);
      
      return {ok: true};
    } catch (error) {
      return {ok: false, error: 'Cloud not create a restaurant'}
    }   
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categoryRepository.find();
      return {ok: true, categories};
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load categories.'
      }
    }
  }

  countRestaurants(category: Category) {
    return this.restaurantRepository.count({category});
  }

  async findCategoryBySlug({slug, page}: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categoryRepository.findOne({slug}, {relations: ['restaurants']});

      if (!category) return {ok: false, error: 'Category not found'};

      const restaurants = await this.restaurantRepository.find(
        {
          where: { category },
          take: 25,
          skip: (page - 1) * 25
        }
      );
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        category,
        totalPages: Math.ceil( totalResults / 25 )
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Cloud not load category.'
      }
    }
  }

  private async getRestaurantIsItOwner (owner, restaurantId: number): Promise<CoreOutput> {
    const restaurant = await this.restaurantRepository.findOne({id: restaurantId});

    if(!restaurant) return {ok: false, error: 'Restaurant not found.'};

    if(owner.id !== restaurant.ownerId) {
      return {ok: false, error: "You can't edit a restaurant that you don't onwer"}
    }
  }
}