import { Entity,JoinTable, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Subreddit } from '../../subreddits/entities/subreddit.entity'; // Adjust path
import { Post } from '../../posts/entities/post.entity';         // Adjust path
import { Comment } from '../../comments/entities/comment.entity'; // Adjust path
import { Role } from 'src/roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string; 

  @ManyToMany(() => Role, role => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // --- Relationships ---

  // Subreddits created by this user (implicitly the first moderator)
  @OneToMany(() => Subreddit, subreddit => subreddit.creator)
  createdSubreddits: Subreddit[];

  // Subreddits this user moderates (Many-to-Many)
  @ManyToMany(() => Subreddit, subreddit => subreddit.moderators)
  moderatedSubreddits: Subreddit[]; // Joined via Subreddit entity

  // Subreddits this user is subscribed to (Many-to-Many)
  @ManyToMany(() => Subreddit, subreddit => subreddit.subscribers)
  subscribedSubreddits: Subreddit[]; // Joined via Subreddit entity

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  hasPermission(permissionName: string): boolean {
    if (!this.roles) return false;
    for (const role of this.roles) {
      if (role.permissions?.some(p => p.name === permissionName)) {
        return true;
      }
    }
    return false;
  }
}