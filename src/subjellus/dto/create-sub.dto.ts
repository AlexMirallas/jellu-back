import { IsString, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';


export class CreateSubjelluDto {
    @IsString()
    @MinLength(3)
    @MaxLength(21) 
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @IsNotEmpty()
    categoryIds?: string[];
}