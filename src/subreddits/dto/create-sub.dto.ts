import { IsString, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';
import { Category } from '../entities/category.entity';

export class CreateSubredditDto {
    @IsString()
    @MinLength(3)
    @MaxLength(21) // Reddit's limit
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @IsNotEmpty()
    categoryIds?: string[];
}