import { Module } from "@nestjs/common";
import { VotesService } from "./votes.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vote } from "./entities/vote.entity";
import { Post } from "../posts/entities/post.entity";
import { Comment } from "../comments/entities/comment.entity";


@Module({
    imports: [
        TypeOrmModule.forFeature([Vote,Post, Comment]),
    ],
    providers: [VotesService],
    controllers: [],
    exports: [VotesService],
    })
export class VotesModule {}