import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from "@nestjs/testing";
import { OrdersService } from "./orders.service";
import { Order } from './entities/order.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { OrderItem } from './entities/order-item.entity';
import { getRepository, Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';

const mockedRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: MockRepository;
  let restaurantRepository: MockRepository;
  let dishRepository: MockRepository;
  let orderItemRepository: MockRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockedRepository()
        },
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockedRepository()
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockedRepository()
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockedRepository()
        },
      ]
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    restaurantRepository = module.get(getRepositoryToken(Restaurant));
    dishRepository = module.get(getRepositoryToken(Dish));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
  })

  it('should be service define', () => {
    expect(service).toBeDefined();
  });

  describe('create order', () => {
    const createOrderArgs = {restaurantId: 1, items: [{dishId: 2}]};
    const user = {email: "gg", password: "ee"};

    it('should error if restaurant not exists.', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);

      // @ts-ignore
      const result = await service.createOrder(user, createOrderArgs);

      expect(result).toEqual({ ok: false, error: 'Restaurant not found.' });
    });

    it('should error if dish not exists.', async () => {
      restaurantRepository.findOne.mockResolvedValue({id: 1});
      dishRepository.findOne.mockResolvedValue(null);

      // @ts-ignore
      const result = await service.createOrder(user, createOrderArgs);
      expect(restaurantRepository.findOne).toBeCalledWith(createOrderArgs.restaurantId);
      expect(restaurantRepository.findOne).toBeCalledTimes(1);
      expect(result).toEqual({ ok: false, error: 'Dish not found.' });
    });
  });
});