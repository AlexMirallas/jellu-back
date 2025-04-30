import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity'; // Adjust the import path as necessary
import { SubredditsModule } from '../subreddits/subreddits.module'; // Import the SubredditsModule to validate subreddit existence
import { VotesService } from 'src/votes/votes.service';
import { VotesModule } from 'src/votes/votes.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    SubredditsModule,
    VotesModule 
  ],
  providers: [PostsService], 
  controllers: [PostsController],
  exports: [PostsService], 
})
export class PostsModule {}
