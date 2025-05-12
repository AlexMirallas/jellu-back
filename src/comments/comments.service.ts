import { Injectable,BadRequestException,NotFoundException } from '@nestjs/common';
import { InjectRepository,} from '@nestjs/typeorm';
import { Repository, TreeRepository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostsService } from '../posts/posts.service'; 
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentsRepository: TreeRepository<Comment>,
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

    async findAllByPostId(postId: string): Promise<Comment[]> {
        // Verify the post exists first (optional, but good practice)
        const post = await this.postsService.findOne(postId);
        if (!post) {
            throw new NotFoundException(`Post with ID "${postId}" not found, cannot fetch comments.`);
        }

        // Find root comments for the post
        const roots = await this.commentsRepository.find({
            where: { 
                post: { id: postId }, // Filter by postId
                parentComment: IsNull()   // Ensure they are root comments (no parent)
            }, 
            relations: ['author', 'votes'], // Load author and votes for root comments
        });

        // For each root, find its descendants (replies)
        // TypeORM's TreeRepository can simplify loading the entire tree.
        // If you want to load the full tree for each root:
        const commentTree: Comment[] = [];
        for (const root of roots) {
            const tree = await this.commentsRepository.findDescendantsTree(root, {
                relations: ['author', 'votes'], // Ensure relations are loaded for descendants too
            });
            commentTree.push(tree);
        }
        return commentTree;

    }
}
