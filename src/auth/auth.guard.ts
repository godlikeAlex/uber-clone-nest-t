import { AllowedRoles } from './role.decorator';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector){}
  
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<AllowedRoles>(
      'roles', 
      ctx.getHandler()
    );
    
    if (!roles) return true;

    const gqlCtx = GqlExecutionContext.create(ctx).getContext();
    const user: User = gqlCtx['user'];

    if (!user) return false;

    if (roles.includes('Any')) return true;

    return roles.includes(user.role);
  }
}