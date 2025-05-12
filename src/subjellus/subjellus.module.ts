import { Module } from '@nestjs/common';
import { SubjelluService } from './subjellus.service';
import { SubjelluController } from './subjellus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subjellu } from './entities/subjellu.entity'; // Adjust the import path as necessary
import { Category } from './entities/category.entity';
import { UsersModule } from '../users/users.module'; // Adjust the import path as necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([Subjellu,Category]),
    UsersModule, // Assuming you have a UserModule for user-related operations
  ],
  
  providers: [SubjelluService],
  controllers: [SubjelluController],
  exports: [SubjelluService],
})
export class SubjelluModule {}
