// filepath: c:\Users\Alexa\Web_Dev\jellu\jellu-backend\src\auth\guards\jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'; // Import the key

/**
 * This guard triggers the JwtStrategy ('jwt').
 * It verifies the JWT token from the Authorization header.
 * If validation succeeds, the payload (or user object) is attached to the request.
 * If validation fails (invalid token, expired, etc.), it throws a 401 UnauthorizedException.
 * It also checks for the @Public() decorator to allow bypassing authentication.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { // References the 'jwt' strategy name
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route handler or the controller class has the @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check method decorator first
      context.getClass(),   // Check class decorator if method doesn't have it
    ]);

    if (isPublic) {
      return true; // Allow access if @Public() is present
    }

    // If not public, proceed with the default JWT authentication flow
    return super.canActivate(context);
  }
}