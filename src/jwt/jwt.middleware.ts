import { UsersService } from './../users/users.service';
import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request } from "express";
import { JwtService } from "./jwt.service";

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService  
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());

        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          try {
            const user = await this.usersService.findOne(decoded['id']);
            req['user'] = user;
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {}
    }
    next();
  }
}