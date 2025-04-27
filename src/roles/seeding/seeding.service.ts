import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';


@Injectable()
export class SeedingService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedingService.name);
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) {}

    async onApplicationBootstrap() {
        this.logger.log('Seeding roles and permissions...');
        await this.seedRolesAndPermissions();
        this.logger.log('Seeding completed.');
    }

    private async seedRolesAndPermissions() {
        // --- Define Permissions ---
        const permissionsData = [
          // User Permissions
          { name: 'read:user:self', description: 'Read own user profile' },
          { name: 'update:user:self', description: 'Update own user profile' },
          // Post Permissions
          { name: 'create:post', description: 'Create a new post' },
          { name: 'read:post', description: 'Read posts' },
          { name: 'update:post:self', description: 'Update own posts' },
          { name: 'delete:post:self', description: 'Delete own posts' },
          // Comment Permissions
          { name: 'create:comment', description: 'Create a new comment' },
          { name: 'read:comment', description: 'Read comments' },
          // Subreddit Permissions
          { name: 'create:subreddit', description: 'Create a new subreddit' },
          // Moderation Permissions
          { name: 'moderate:subreddit', description: 'Moderate posts/comments in owned/moderated subreddits' },
          { name: 'delete:post:any', description: 'Delete any post (Admin/Mod)' },
          { name: 'delete:comment:any', description: 'Delete any comment (Admin/Mod)' },
          // Admin Permissions
          { name: 'manage:users', description: 'Manage all users (Admin)' },
    { name: 'manage:roles', description: 'Manage roles and permissions (Admin)' },
        ];
    
        const permissionsMap = new Map<string, Permission>();
        for (const data of permissionsData) {
          let permission = await this.permissionRepository.findOne({ where: { name: data.name } });
          if (!permission) {
            permission = this.permissionRepository.create(data);
            await this.permissionRepository.save(permission);
            this.logger.log(`Created permission: ${permission.name}`);
          }
          permissionsMap.set(permission.name, permission);
        }
    
        // --- Define Roles and Assign Permissions ---
        const rolesData = [
          {
            name: 'USER',
            description: 'Regular User',
            permissions: [
              'read:user:self', 'update:user:self',
              'create:post', 'read:post', 'update:post:self', 'delete:post:self',
              'create:comment', 'read:comment',
              'create:subreddit',
            ],
          },
          {
            name: 'MODERATOR', // Example: Subreddit Moderator
            description: 'Subreddit Moderator',
            permissions: [
     'moderate:subreddit', // Specific logic needed elsewhere to check *which* subreddit
              'delete:post:any',    // Or maybe just within their subreddits
              'delete:comment:any', // Or maybe just within their subreddits
              // Inherits USER permissions implicitly or explicitly add them
              'read:user:self', 'update:user:self',
              'create:post', 'read:post', 'update:post:self', 'delete:post:self',
              'create:comment', 'read:comment',
              'create:subreddit',
            ],
          },
          {
            name: 'ADMIN',
            description: 'Administrator',
            permissions: permissionsData.map(p => p.name), // Admin gets all permissions
          },
        ];
    
        for (const data of rolesData) {
          let role = await this.roleRepository.findOne({ where: { name: data.name }, relations: ['permissions'] });
          const rolePermissions = data.permissions.map(name => permissionsMap.get(name)).filter(p => p !== undefined) as Permission[];
    
          if (!role) {
            role = this.roleRepository.create({
              name: data.name,
              description: data.description,
              permissions: rolePermissions,
            });
            await this.roleRepository.save(role);
            this.logger.log(`Created role: ${role.name} with ${role.permissions.length} permissions`);
          } else {
            // Optional: Update existing role permissions if needed
            const existingPermNames = new Set(role.permissions.map(p => p.name));
            const newPermissions = rolePermissions.filter(p => !existingPermNames.has(p.name));
            if (newPermissions.length > 0) {
                role.permissions.push(...newPermissions);
                await this.roleRepository.save(role);
                this.logger.log(`Updated role ${role.name} with ${newPermissions.length} new permissions`);
     }
      }
      }
    }
    


}
