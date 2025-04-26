import { IsEmail, IsNotEmpty, MinLength,MaxLength, IsOptional, IsEnum } from "class-validator";
import { Index } from "typeorm";
import { Role } from "../../common/types/enums"; // Adjust path


export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid email format' }) 
    @IsNotEmpty() 
    email: string;

    @Index({ unique: true })
    @IsNotEmpty({message: 'Username is required'})
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(30, { message: 'Username must be at most 30 characters long' })
    username: string;

    @IsNotEmpty({message: 'Password is required'})
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role
    
}
