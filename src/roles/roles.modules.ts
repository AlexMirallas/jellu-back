import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding/seeding.service';
import { Role } from '../roles/entities/role.entity'; 
import { Permission } from '../permissions/entities/permission.entity'; 
import { Subjellu } from 'src/subjellus/entities/subjellu.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity'; 



@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission,Subjellu, User, Post, Comment]), 
  ],
  providers: [SeedingService,Subjellu,UsersService],
  exports: [SeedingService],
})
export class RolesModule {} 