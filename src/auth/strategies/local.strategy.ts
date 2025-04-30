import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') { // 'local' is the default name
  constructor(private authService: AuthService) {
    super({
      usernameField: 'identifier', // Specify the field name for username in the request body (default is 'username')
      // passwordField: 'password' // Specify the field name for password (default is 'password')
    });
  }

  /**
   * Passport automatically calls this method when using the AuthGuard('local').
   * It receives the credentials (username, password) extracted from the request body.
   * @param identifier The username extracted from the request.
   * @param password The password extracted from the request.
   * @returns The validated user object (without password).
   * @throws UnauthorizedException if validation fails.
   */
  async validate(identifier: string, pass: string): Promise<Omit<User, 'passwordHash'>> {
  
    const user = await this.authService.validateUser(identifier, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; 
  }
}
