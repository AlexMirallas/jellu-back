import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding/seeding.service';
import { Role } from '../roles/entities/role.entity'; // Adjust path
import { Permission } from '../permissions/entities/permission.entity'; // Adjust path

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]), // Make repositories available
  ],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class RolesModule {} 