import { IsString , MinLength, MaxLength, IsOptional} from "class-validator";

export class UpdateCommentDto {
    @IsString()
    @MinLength(2)
    @MaxLength(500) 
    content: string; 
}