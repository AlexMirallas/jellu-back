import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy'; // We will create this next
import { JwtStrategy } from './strategies/jwt.strategy'; // We will create this next
import { UsersService } from '../users/users.service'; // Import UsersService if needed directly (or rely on UsersModule export)
import { AuthService } from './auth.service';
import { Type } from 'class-transformer';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Role,Permission]), // Import User entity if needed directly (or rely on UsersModule export)
    UsersModule, // Make sure UsersService is exported from UsersModule
    PassportModule,
    ConfigModule, // Ensure ConfigModule is imported globally or here
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule here too
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') },
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy, // Will be created soon
    JwtStrategy,   // Will be created soon
  ],
  controllers: [AuthController], // We will create this controller
  exports: [AuthService], // Export AuthService if other modules need login functionality
})
export class AuthModule {}
