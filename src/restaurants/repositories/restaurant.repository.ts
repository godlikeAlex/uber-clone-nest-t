import { EntityRepository, Repository } from "typeorm";
import { Restaurant } from "../entities/restaurant.entity";

type FindAndPagenationParams = {
  where?: Object;
  page: number;
}

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async findWithPagenation({where, page}: FindAndPagenationParams) {
    const result = await this.findAndCount(
      {
        where: where || undefined,
        take: 25,
        skip: (page - 1) * 25,
        order: {
          isPromoted: 'DESC'
        }
      }
    );
    
    return result;
  };
}