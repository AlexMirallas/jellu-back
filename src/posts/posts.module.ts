import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity'; 
import { SubjelluModule } from '../subjellus/subjellus.module'; 
import { VotesService } from 'src/votes/votes.service';
import { VotesModule } from 'src/votes/votes.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    SubjelluModule,
    VotesModule 
  ],
  providers: [PostsService], 
  controllers: [PostsController],
  exports: [PostsService], 
})
export class PostsModule {}
