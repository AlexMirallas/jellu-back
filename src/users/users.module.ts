import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import {RolesService} from '../roles/roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role])
  ],
  providers: [UsersService, RolesService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
