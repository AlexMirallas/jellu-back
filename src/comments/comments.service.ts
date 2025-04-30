import { Injectable,BadRequestException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostsService } from '../posts/posts.service'; 
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentsRepository: Repository<Comment>,
        private postsService: PostsService, 
    ) {}

    async create(createCommentDto: CreateCommentDto, author: User): Promise<Comment> {
        const { content, postId, parentId } = createCommentDto;
        
        const post = await this.postsService.findOne(postId);
        let parentComment: Comment | null = null;

        if (parentId) {
            parentComment = await this.commentsRepository.findOne({
                 where: { id: parentId },
                 relations: ['post'] // Include post relation to check postId
            });
            if (!parentComment) {
                throw new NotFoundException(`Parent comment with ID "${parentId}" not found`);
            }
            // Ensure the parent comment belongs to the same post
            if (parentComment.post.id !== postId) {
                throw new BadRequestException('Parent comment does not belong to the specified post.');
            }
        }

        const comment = this.commentsRepository.create({
            content,
            author: author, 
            post: post,     
            parentComment: parentComment? parentComment : undefined, // Set to null if no parent comment
        });
        return this.commentsRepository.save(comment);
    }

    async findAllByPost(postId: string): Promise<Comment[]> {

        await this.postsService.findOne(postId);

        return this.commentsRepository.find({
            where: { post: { id: postId } },
            relations: ['author', 'parent', 'children'], // Load relations as needed
            order: { createdAt: 'ASC' }, // Or DESC
        });
    }


}
