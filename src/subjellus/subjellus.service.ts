import { Injectable, } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import { Repository,In } from 'typeorm';
import { Subjellu } from './entities/subjellu.entity';
import { CreateSubjelluDto } from './dto/create-sub.dto';
import { UpdateSubjelluDto } from './dto/update-sub.dto';
import { User } from '../users/entities/user.entity';
import { NotFoundException , ForbiddenException} from '@nestjs/common/exceptions';
import { Category } from './entities/category.entity';

@Injectable()
export class SubjelluService {
    constructor(
        @InjectRepository(Subjellu)
        private subjelluRepository: Repository<Subjellu>,

        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    async findAll(limit: number = 10, offset: number=0): Promise<Subjellu[]> {
        return this.subjelluRepository.find({
            take: limit,
            skip: offset,
            order: {name: 'ASC',},
            relations: ['creator', 'categories'],

        });
    }

    async create(createSubjelluDto: CreateSubjelluDto, creator: User): Promise<Subjellu> {
        const { categoryIds, ...restDto } = createSubjelluDto;

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

        const subjellu = this.subjelluRepository.create({
            ...restDto,
            creator: creator,
            categories: foundCategories, 
        });
       
        return this.subjelluRepository.save(subjellu);
    }

    async findOne(idOrName: string): Promise<Subjellu> {
        // Find by ID (UUID) or Name
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrName);
        const whereCondition = isUuid ? { id: idOrName } : { name: idOrName };

        const subjellu = await this.subjelluRepository.findOne({
             where: whereCondition,
             relations: ['creator'], // Load relations as needed
        });
        if (!subjellu) {
            throw new NotFoundException(`subjellu with identifier "${idOrName}" not found`);
        }
        return subjellu;
    }
    async update(id: string, updateSubjelluDto: UpdateSubjelluDto, userId: string): Promise<Subjellu> {
        const subjellu = await this.findOne(id); // Reuse findOne to check existence

        // Authorization check: Only creator or moderator can update (add moderator logic later)
        if (subjellu.creator.id !== userId) {
            throw new ForbiddenException('You do not have permission to update this subjellu.');
        }

        // Merge changes
        this.subjelluRepository.merge(subjellu, updateSubjelluDto);
        return this.subjelluRepository.save(subjellu);
    }

    async remove(id: string, userId: string): Promise<void> {
        const subjellu = await this.findOne(id);

        // Authorization check: Only creator can delete (or admin)
        if (subjellu.creator.id !== userId) {
             throw new ForbiddenException('You do not have permission to delete this subjellu.');
        }

        const result = await this.subjelluRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`subjellu with ID "${id}" not found`);
        }
    }
}
