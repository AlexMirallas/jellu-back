import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @MinLength(1)
    @MaxLength(300) // Reddit title limit
    title: string;

    @IsString()
    @IsOptional()
    content?: string; // For text posts

   

    @IsUUID()
    subjelluId: string; // ID of the subreddit to post to

}