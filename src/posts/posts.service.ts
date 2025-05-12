import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/entities/user.entity';
import { SubjelluService } from '../subjellus/subjellus.service'; 

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private postsRepository: Repository<Post>,
        private subjelluService: SubjelluService, 
    ) {}

    async create(createPostDto: CreatePostDto, author: User): Promise<Post> {
        // Validate subjellu exists
        const subjellu = await this.subjelluService.findOne(createPostDto.subjelluId);
        // Add checks if user is allowed to post in this subjellu (e.g., joined, not banned)

        const post = this.postsRepository.create({
            ...createPostDto,
            author: author,
            subjellu: subjellu, 
        });
        return this.postsRepository.save(post);
    }

    async findAllBySubjellu(subjelluId: string, limit: number = 1000, offset: number = 0): Promise<Post[]> {
       

        return this.postsRepository.find({
            where: { subjellu: { id: subjelluId } },
            relations: ['author', 'subjellu'], 
            order: { createdAt: 'DESC' }, 
            take: limit,
            skip: offset,
        });
    }

    async findOne(id: string): Promise<Post> {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['author', 'subjellu', 'comments'], // Load relations
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

        // Authorization: Only author or subjellu moderator/creator can delete
        // Add moderator check later
        if (post.author.id !== userId && post.subjellu.creator.id !== userId) {
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
            .leftJoinAndSelect('post.subjellu', 'subjellu') 
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .orderBy('post.createdAt', 'DESC')
            .skip(offset)
            .take(limit)
            .getMany();

        return posts;
    }


    async findOneWithComments(id: string): Promise<Post> {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['author', 'subjellu', 'comments','comments.votes'], // Load relations
        });
        if (!post) {
            throw new NotFoundException(`Post with ID "${id}" not found`);
        }
        return post;
    }
    
}