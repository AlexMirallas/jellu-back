import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateSubredditDto {
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    bannerUrl?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    iconUrl?: string;

    @IsString()
    @IsOptional()
    rules?: string; 
}