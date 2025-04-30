import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/entities/user.entity';
import { SubredditsService } from '../subreddits/subreddits.service'; // Inject to validate subreddit

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private postsRepository: Repository<Post>,
        private subredditsService: SubredditsService, // Inject Subreddit service
    ) {}

    async create(createPostDto: CreatePostDto, author: User): Promise<Post> {
        // Validate subreddit exists
        const subreddit = await this.subredditsService.findOne(createPostDto.subredditId);
        // Add checks if user is allowed to post in this subreddit (e.g., joined, not banned)

        const post = this.postsRepository.create({
            ...createPostDto,
            author: author,
            subreddit: subreddit, // Assign the subreddit entity
        });
        return this.postsRepository.save(post);
    }

    async findAllBySubreddit(subredditId: string, limit: number = 20, offset: number = 0): Promise<Post[]> {
        // Validate subreddit exists first if needed
        // await this.subredditsService.findOne(subredditId);

        return this.postsRepository.find({
            where: { subreddit: { id: subredditId } },
            relations: ['author', 'subreddit'], // Load author and subreddit info
            order: { createdAt: 'DESC' }, // Default sort by new
            take: limit,
            skip: offset,
        });
    }

    async findOne(id: string): Promise<Post> {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['author', 'subreddit', 'comments'], // Load relations
        });
        if (!post) {
            throw new NotFoundException(`Post with ID "${id}" not found`);
        }
        return post;
    }

    async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<Post> {
        const post = await this.findOne(id);

        // Authorization: Only author can update
        if (post.author.id !== userId) {
            throw new ForbiddenException('You do not have permission to update this post.');
        }

        this.postsRepository.merge(post, updatePostDto);
        return this.postsRepository.save(post);
    }

    async remove(id: string, userId: string): Promise<void> {
        const post = await this.findOne(id);

        // Authorization: Only author or subreddit moderator/creator can delete
        // Add moderator check later
        if (post.author.id !== userId && post.subreddit.creator.id !== userId) {
             throw new ForbiddenException('You do not have permission to delete this post.');
        }

        const result = await this.postsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Post with ID "${id}" not found`);
        }
    }

    async findAll(limit: number = 20, offset: number = 0): Promise<Post[]> {
        const posts = await this.postsRepository.createQueryBuilder('post')
            .leftJoinAndSelect('post.author', 'author') 
            .leftJoinAndSelect('post.subreddit', 'subreddit') 
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .orderBy('post.createdAt', 'DESC')
            .skip(offset)
            .take(limit)
            .getMany();

        return posts;
    }
}