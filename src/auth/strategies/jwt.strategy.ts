import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity'; // Import User entity

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService 
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  async validate(payload: any): Promise<User> { // Return the full User object
    console.log('JWT Strategy validating payload:', payload);
    const user = await this.usersService.findOneById(payload.sub); // Fetch user by ID from payload
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Roles/Permissions should be loaded due to eager loading in User/Role entities
    return user; // Attach the full user object (with roles/permissions) to request.user
  }
}