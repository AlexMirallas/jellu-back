import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Tree, TreeChildren, TreeParent } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Adjust path
import { Post } from '../../posts/entities/post.entity'; // Adjust path

@Entity('comments')
@Tree('materialized-path') // Or 'closure-table', 'nested-set' for comment threading
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => User, user => user.comments, { nullable: false, eager: true }) // Eager load author
  author: User;

  @ManyToOne(() => Post, post => post.comments, { nullable: false, onDelete: 'CASCADE' }) // Delete comments if post is deleted
  post: Post;

  // --- Threading Relationships ---
  @TreeChildren()
  replies: Comment[];

  @TreeParent({ onDelete: 'CASCADE' }) // Delete replies if parent comment is deleted
  parentComment: Comment;

  // Add vote counts later
  // @Column({ default: 0 })
  // score: number;
}