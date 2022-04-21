import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements  CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndMerge('roles', [
      context.getClass(),
      context.getHandler(),
    ]);
    const user = context.switchToHttp().getRequest().user;
  
    return user && (!requiredRoles.length || requiredRoles.includes(user.role));
  }
}