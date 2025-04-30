import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VotesService {
    constructor(
        @InjectRepository(Vote)
        private readonly voteRepository: Repository<Vote>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
    ) {}

    async voteOnPost(user: User, postId: string, value: number): Promise<void> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new Error('Post not found');

        let vote = await this.voteRepository.findOne({ where: { user, post } });
        if (!vote) {
            vote = this.voteRepository.create({ user, post, value });
        } else {
            vote.value = value; // Update the vote value
        }
        await this.voteRepository.save(vote);

        // Update post score
        const score = await this.voteRepository
            .createQueryBuilder('vote')
            .select('SUM(vote.value)', 'score')
            .where('vote.postId = :postId', { postId })
            .getRawOne();
        post.score = score.score || 0;
        await this.postRepository.save(post);
    }

    async voteOnComment(user: User, commentId: string, value: number): Promise<void> {
        const comment = await this.commentRepository.findOne({ where: { id: commentId } });
        if (!comment) throw new Error('Comment not found');

        let vote = await this.voteRepository.findOne({ where: { user, comment } });
        if (!vote) {
            vote = this.voteRepository.create({ user, comment, value });
        } else {
            vote.value = value; // Update the vote value
        }
        await this.voteRepository.save(vote);

        // Update comment score
        const score = await this.voteRepository
            .createQueryBuilder('vote')
            .select('SUM(vote.value)', 'score')
            .where('vote.commentId = :commentId', { commentId })
            .getRawOne();
        comment.score = score.score || 0;
        await this.commentRepository.save(comment);
    }
}