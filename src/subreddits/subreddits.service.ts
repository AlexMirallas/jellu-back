import { Injectable, } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import { Repository,In } from 'typeorm';
import { Subreddit } from './entities/subreddit.entity';
import { CreateSubredditDto } from './dto/create-sub.dto';
import { UpdateSubredditDto } from './dto/update-sub.dto';
import { User } from '../users/entities/user.entity';
import { NotFoundException , ForbiddenException} from '@nestjs/common/exceptions';
import { Category } from './entities/category.entity';

@Injectable()
export class SubredditsService {
    constructor(
        @InjectRepository(Subreddit)
        private subredditRepository: Repository<Subreddit>,

        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    async findAll(limit: number = 10, offset: number=0): Promise<Subreddit[]> {
        return this.subredditRepository.find({
            take: limit,
            skip: offset,
            order: {name: 'ASC',},
            relations: ['creator', 'categories'],

        });
    }

    async create(createSubredditDto: CreateSubredditDto, creator: User): Promise<Subreddit> {
        const { categoryIds, ...restDto } = createSubredditDto;

        let foundCategories :Category[] = [];

        if (categoryIds && categoryIds.length > 0) {
            // Fetch the Category entities based on the provided IDs
            foundCategories = await this.categoryRepository.findBy({
                 id: In(categoryIds) // Use the 'In' operator to find multiple IDs
            });
            // Optional: Check if all requested category IDs were found
            if (foundCategories.length !== categoryIds.length) {
                 // Handle error - some categories not found
                 throw new NotFoundException('One or more specified categories were not found.');
            }
        }

        const subreddit = this.subredditRepository.create({
            ...restDto,
            creator: creator,
            categories: foundCategories, 
        });
       
        return this.subredditRepository.save(subreddit);
    }

    async findOne(idOrName: string): Promise<Subreddit> {
        // Find by ID (UUID) or Name
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrName);
        const whereCondition = isUuid ? { id: idOrName } : { name: idOrName };

        const subreddit = await this.subredditRepository.findOne({
             where: whereCondition,
             relations: ['creator'], // Load relations as needed
        });
        if (!subreddit) {
            throw new NotFoundException(`Subreddit with identifier "${idOrName}" not found`);
        }
        return subreddit;
    }
    async update(id: string, updateSubredditDto: UpdateSubredditDto, userId: string): Promise<Subreddit> {
        const subreddit = await this.findOne(id); // Reuse findOne to check existence

        // Authorization check: Only creator or moderator can update (add moderator logic later)
        if (subreddit.creator.id !== userId) {
            throw new ForbiddenException('You do not have permission to update this subreddit.');
        }

        // Merge changes
        this.subredditRepository.merge(subreddit, updateSubredditDto);
        return this.subredditRepository.save(subreddit);
    }

    async remove(id: string, userId: string): Promise<void> {
        const subreddit = await this.findOne(id);

        // Authorization check: Only creator can delete (or admin)
        if (subreddit.creator.id !== userId) {
             throw new ForbiddenException('You do not have permission to delete this subreddit.');
        }

        const result = await this.subredditRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Subreddit with ID "${id}" not found`);
        }
    }
}
