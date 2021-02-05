import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuards implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const gqlCtx = GqlExecutionContext.create(ctx).getContext();
    const user = gqlCtx['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}