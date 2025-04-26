import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../users/entities/user.entity'; 

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required, allow access (JwtAuthGuard should still run)
    }

    const { user } = context.switchToHttp().getRequest<{ user?: User }>(); // Assumes user object is attached by JwtAuthGuard/JwtStrategy

    if (!user) {
        // This shouldn't happen if JwtAuthGuard runs first, but good practice
        return false;
    }

    // Check if the user object has the helper method and use it
    const hasRequiredPermission = requiredPermissions.every(permission =>
        user.hasPermission && user.hasPermission(permission)
    );

    // Alternative: Manual check if helper method doesn't exist
    // const hasRequiredPermission = requiredPermissions.every(permission =>
    //   user.roles?.some(role =>
    //     role.permissions?.some(p => p.name === permission)
    //   )
    // );

    if (!hasRequiredPermission) {
        throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}