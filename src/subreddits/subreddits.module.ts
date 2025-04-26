import { Module } from '@nestjs/common';
import { SubredditsService } from './subreddits.service';
import { SubredditsController } from './subreddits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subreddit } from './entities/subreddit.entity'; // Adjust the import path as necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([Subreddit]),
  ],
  providers: [SubredditsService],
  controllers: [SubredditsController]
})
export class SubredditsModule {}
