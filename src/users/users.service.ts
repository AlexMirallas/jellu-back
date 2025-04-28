import { Injectable, NotFoundException,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from './entities/user.entity'; // Assuming you have a User entity

@Injectable()
export class UsersService {
    // This service will handle the logic for managing users
    // It will interact with the database to create, read, update, and delete users
    // It will also handle the assignment of roles to users
    
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>, 
    ) {}

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id }, relations:{roles:true} });
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email }, relations:{roles:true} });
    }

    
    /** 
        @param identifier
        @returns User | null
    */
    async findOneByEmailOrUsername(identifier : string): Promise<User | null> {
        return this.usersRepository.findOne({ where: [{ email: identifier }, { username: identifier }], relations: {roles:{permissions: true} }  });
    }


    async findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ 
            where: { id },
            relations:{roles:{
                permissions:true
            }}
         });
    }

    async findOneByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ 
            where: { username },
            relations:{roles:true}
         });
    }

    async create(userData: DeepPartial<User>): Promise<User> {
        // Optional: Add checks for existing username/email before creating
        const existingUserByUsername = await this.usersRepository.findOne({ where: { username: userData.username } });
        if (existingUserByUsername) {
          throw new ConflictException(`Username '${userData.username}' already exists.`);
        }
        const existingUserByEmail = await this.usersRepository.findOne({ where: { email: userData.email } });
        if (existingUserByEmail) {
          throw new ConflictException(`Email '${userData.email}' is already registered.`);
        }
    
        // Use the repository's create method. It takes partial data and returns a new entity instance.
        const newUserEntity = this.usersRepository.create(userData);
    
        // Save the newly created entity instance. TypeORM handles assigning id, createdAt, etc.
        return this.usersRepository.save(newUserEntity);
      }
    

    async update(id: string, user: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, user);
        const updatedUser = await this.usersRepository.findOne({ where: { id } });
        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return updatedUser;
    }

    
    
}
