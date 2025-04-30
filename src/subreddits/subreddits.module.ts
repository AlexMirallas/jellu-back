import { Module } from '@nestjs/common';
import { SubredditsService } from './subreddits.service';
import { SubredditsController } from './subreddits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subreddit } from './entities/subreddit.entity'; // Adjust the import path as necessary
import { Category } from './entities/category.entity';
import { UsersModule } from '../users/users.module'; // Adjust the import path as necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([Subreddit,Category]),
    UsersModule, // Assuming you have a UserModule for user-related operations
  ],
  
  providers: [SubredditsService],
  controllers: [SubredditsController],
  exports: [SubredditsService],
})
export class SubredditsModule {}
