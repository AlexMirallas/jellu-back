import { Entity,JoinTable, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Subjellu } from '../../subjellus/entities/subjellu.entity';
import { Post } from '../../posts/entities/post.entity';         
import { Comment } from '../../comments/entities/comment.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Exclude } from 'class-transformer';
import { Vote } from '../../votes/entities/vote.entity'; 

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true })
  email: string;

  
  @Column()
  @Exclude()
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

  // Subs created by this user (implicitly the first moderator)
  @OneToMany(() => Subjellu, subjellu => subjellu.creator)
  createdSubjellus: Subjellu[];

  // Subs this user moderates (Many-to-Many)
  @ManyToMany(() => Subjellu, subjellu => subjellu.moderators)
  moderatedSubjellus: Subjellu[]; 

  // Subs this user is subscribed to (Many-to-Many)
  @ManyToMany(() => Subjellu, subjellu => subjellu.subscribers)
  subscribedSubjellus: Subjellu[]; 

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  @OneToMany(() => Vote, vote => vote.user)
  votes: Vote[];

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