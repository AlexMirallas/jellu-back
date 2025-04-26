import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';         // Adjust path
import { Subreddit } from '../../subreddits/entities/subreddit.entity'; // Adjust path
import { Comment } from '../../comments/entities/comment.entity'; // Adjust path

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'text', nullable: true }) // Allow text posts or link posts (add URL field if needed)
  content: string;

  // Optional: Add fields like 'url' for link posts, 'type' (link/text)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => User, user => user.posts, { nullable: false, eager: true }) // Often useful to load author with post
  author: User;

  @ManyToOne(() => Subreddit, subreddit => subreddit.posts, { nullable: false })
  subreddit: Subreddit;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  // Add vote counts later if needed
  // @Column({ default: 0 })
  // score: number;
}