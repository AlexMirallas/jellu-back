import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding/seeding.service';
import { Role } from '../roles/entities/role.entity'; 
import { Permission } from '../permissions/entities/permission.entity'; 
import { Subreddit } from 'src/subreddits/entities/subreddit.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity'; 



@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission,Subreddit, User, Post, Comment]), 
  ],
  providers: [SeedingService,Subreddit,UsersService],
  exports: [SeedingService],
})
export class RolesModule {} 