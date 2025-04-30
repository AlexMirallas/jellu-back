import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity'; // Adjust the path as necessary
import { PostsModule } from 'src/posts/posts.module';
import { VotesModule } from 'src/votes/votes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]), 
    PostsModule,
    VotesModule
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService], 
})
export class CommentsModule {}
