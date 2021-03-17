import { AllowedRoles } from './role.decorator';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import {JwtService} from "../jwt/jwt.service";
import {UsersService} from "../users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<AllowedRoles>(
      'roles', 
      ctx.getHandler()
    );
    
    if (!roles) return true;

    const gqlCtx = GqlExecutionContext.create(ctx).getContext();
    const token = gqlCtx['token'];

    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.usersService.findOne(decoded['id']);

        if (!user) return false;
        gqlCtx['user'] = user;
        if (roles.includes('Any')) return true;

        return roles.includes(user.role);
      }
    } else return false;
  }
}