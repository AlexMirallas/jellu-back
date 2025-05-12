import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import { Subjellu } from 'src/subjellus/entities/subjellu.entity';
import { UsersService } from 'src/users/users.service';
import { Post } from '../../posts/entities/post.entity'; // Import Post entity
import { Comment } from '../../comments/entities/comment.entity';


@Injectable()
export class SeedingService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedingService.name);
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        @InjectRepository(Subjellu)
        private readonly subjelluRepository: Repository<Subjellu>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>, // Inject Post repository
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>, // Inject Comment repository
        private readonly usersService: UsersService,
    ) {}

    async onApplicationBootstrap() {
        this.logger.log('Seeding roles and permissions...');
        await this.seedRolesAndPermissions();
        this.logger.log('Seeding subjellus...');
        await this.seedDefaultSubjellus();
        this.logger.log('Seeding posts and comments...');
        await this.seedPostsAndComments()
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
          { name: 'create:subjellu', description: 'Create a new subjellu' },
          // Moderation Permissions
          { name: 'moderate:subjellu', description: 'Moderate posts/comments in owned/moderated subreddits' },
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
              'create:subjellu',
            ],
          },
          {
            name: 'MODERATOR', 
            description: 'Subjellu Moderator',
            permissions: [
     'moderate:subjellu',
              'delete:post:any',    
              'delete:comment:any', 
              'read:user:self', 'update:user:self',
              'create:post', 'read:post', 'update:post:self', 'delete:post:self',
              'create:comment', 'read:comment',
              'create:subjellu',
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

        private async seedDefaultSubjellus() {
          // Find a user to be the creator (e.g., the first admin user)
          // This is a simplification; you might have a dedicated system user
          let creator = await this.usersService.findOneByEmailOrUsername('new_user_name'); // Assuming an 'admin' user exists
          if (!creator) {
              // Fallback: find the first user? Or handle error appropriately.
              const users = await this.usersService.findAll();
              if (users.length > 0) {
                  creator = users[0];
                  this.logger.warn(`Admin user not found for seeding subjellus. Using user: ${creator.username}`);
              } else {
                  this.logger.error('Cannot seed subjellus: No users found in the database to assign as creator.');
                  return; // Stop seeding if no user found
              }
          }
  
  
          const defaultSubjellus = [
              { name: 'announcements', description: 'Official Jellu announcements.', creator },
              { name: 'funny', description: 'Funny pictures, videos, and jokes.', creator },
              { name: 'AskJellu', description: 'Ask the Jellu community anything.', creator },
              { name: 'pics', description: 'Share your pictures.', creator },
              { name: 'science', description: 'Discuss science news and discoveries.', creator },
              { name: 'technology', description: 'Latest tech news and discussions.', creator },
              { name: 'gaming', description: 'All things gaming.', creator },
              { name: 'movies', description: 'Movie news and discussions.', creator },
              { name: 'music', description: 'Share and discuss music.', creator },
              { name: 'worldnews', description: 'Global news headlines.', creator },
       ];
  
          for (const subData of defaultSubjellus) {
              const existingSub = await this.subjelluRepository.findOne({ where: { name: subData.name } });
              if (!existingSub) {
                  const newSub = this.subjelluRepository.create(subData);
                  await this.subjelluRepository.save(newSub);
                  this.logger.log(`Created default subjellu: r/${newSub.name}`);
              }
          }
        }

        private async seedPostsAndComments() {
          const subjellus = await this.subjelluRepository.find();
          const users = await this.usersService.findAll();
  
          if (subjellus.length === 0 || users.length === 0) {
              this.logger.error('Cannot seed posts and comments: No subjellu or users found.');
              return;
          }
  
          const samplePosts = [
              { title: 'Welcome to Jellu!', content: 'This is the first post in this subjellu.' },
              { title: 'What are your thoughts?', content: 'Share your opinions below.' },
              { title: 'Check this out!', content: 'Here is something interesting to discuss.' },
              { title: 'Ask me anything!', content: 'Feel free to ask your questions.' },
              { title: 'Breaking news!', content: 'Here is the latest update on this topic.' },
          ];
  
          const sampleComments = [
              'This is amazing!',
              'I completely agree.',
              'Can you explain more?',
              'This is hilarious!',
              'Thanks for sharing!',
              'I have a different opinion.',
              'This is very informative.',
              'Great post!',
              'I love this community!',
              'Keep up the good work!',
          ];
  for (const subjellu of subjellus) {
              for (const postData of samplePosts) {
                  const randomUser = users[Math.floor(Math.random() * users.length)];
                  const post = this.postRepository.create({
                      ...postData,
                      subjellu,
                      author: randomUser,
                  });
                  await this.postRepository.save(post);
                  this.logger.log(`Created post: "${post.title}" in subjellu: r/${subjellu.name}`);
  
                  // Add random comments to the post
                  const numberOfComments = Math.floor(Math.random() * 5) + 1; // 1 to 5 comments
                  for (let i = 0; i < numberOfComments; i++) {
                      const randomCommentUser = users[Math.floor(Math.random() * users.length)];
                      const randomCommentContent = sampleComments[Math.floor(Math.random() * sampleComments.length)];
                      const comment = this.commentRepository.create({
                          content: randomCommentContent,
                          post,
                          author: randomCommentUser,
                      });
                      await this.commentRepository.save(comment);
                      this.logger.log(`Added comment: "${comment.content}" to post: "${post.title}"`);
                  }
              }
          }
      }    
}
