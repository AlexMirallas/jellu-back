import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Adjust path if needed
import { Post } from '../../posts/entities/post.entity'; // Adjust path if needed

@Entity('subreddits')
export class Subreddit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 }) // Subreddit names are typically unique and have length limits
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // --- Relationships ---

  // The user who created the subreddit
  @ManyToOne(() => User, user => user.createdSubreddits, { nullable: false })
  creator: User;

  // Users who moderate this subreddit
  @ManyToMany(() => User, user => user.moderatedSubreddits)
  @JoinTable({ // Define the join table for the many-to-many relationship
    name: 'subreddit_moderators', // Name of the join table
    joinColumn: { name: 'subredditId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  moderators: User[];

  // Users who are subscribed to this subreddit
  @ManyToMany(() => User, user => user.subscribedSubreddits)
  @JoinTable({
    name: 'subreddit_subscribers',
    joinColumn: { name: 'subredditId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  subscribers: User[];

  // Posts belonging to this subreddit
  @OneToMany(() => Post, post => post.subreddit)
  posts: Post[];
}