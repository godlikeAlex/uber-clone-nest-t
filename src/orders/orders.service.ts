import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateDishOutput } from "src/restaurants/dtos/create-dish.dto";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>
  ) {}

  async createOrder(): Promise<CreateDishOutput> {
    return ;
  }
}