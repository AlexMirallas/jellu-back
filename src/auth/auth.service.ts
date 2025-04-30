import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from '../users/dto/create-user.dto'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  /**
   * Validates a user based on username and password.
   * @param identifier The username or email to validate.
   * @param pass The plaintext password to compare.
   * @returns The user object (without password) if validation is successful, otherwise null.
   */
  async validateUser(identifier: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findOneByEmailOrUsername(identifier); // Assumes findOneByUsername exists in UsersService
    if (user && user.passwordHash) {
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (isMatch) {
            console.log('Password match successful for user:', user.username); // Debugging line
            return user;
        }
    }
    return null; 
  }

  /**
   * Generates a JWT for a given user.
   * @param user The user object (should include id and username, potentially roles).
   * @returns An object containing the access token.
   */
  async login(user: Omit<User, 'passwordHash'>) {
    const payload = { username: user.username, sub: user.id, roles: user.roles  };
    console.log('Generating JWT for user:', payload); // Debugging line
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(user: Omit<User, 'passwordHash'>) {
    // Implement logout logic if needed (e.g., invalidate token, etc.)
    // For stateless JWT, you might not need to do anything here.
    return { message: 'Logged out successfully' };
  }

  async register(createUserDto: CreateUserDto): Promise<User> { // Use DTO
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Find the default 'USER' role (ensure it exists in your DB via seeding)
    const defaultRole = await this.rolesRepository.findOne({ where: { name: 'USER' } });
    if (!defaultRole) {
        // Handle error: Default role not found. Maybe throw an InternalServerErrorException
        throw new Error('Default user role not found. Please seed the database.');
    }

    // Create user data, excluding plain password and including hashed password and default role
    const userData = {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash: hashedPassword,
        roles: [defaultRole], // Assign the default role in an array
    };

    // Use UsersService to create the user
    const newUser = await this.usersService.create(userData); // Ensure UsersService.create accepts this structure
    return newUser;
 }

}
