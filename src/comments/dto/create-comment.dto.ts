import { IsString , MinLength, MaxLength, IsUUID, IsOptional} from "class-validator";

export class CreateCommentDto {
    @IsString()
    @MinLength(2)
    @MaxLength(500) 
    content: string; 

    @IsUUID()
    postId: string;

    @IsOptional()
    @IsUUID()
    parentId: string 
}