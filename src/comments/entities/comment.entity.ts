import { Entity, OneToMany, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Tree, TreeChildren, TreeParent } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 
import { Post } from '../../posts/entities/post.entity'; 
import { Vote } from '../../votes/entities/vote.entity'; 

@Entity('comments')
@Tree('materialized-path') 
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

  @TreeParent({ onDelete: 'CASCADE' }) 
  parentComment: Comment;

  @OneToMany(() => Vote, vote => vote.comment)
  votes: Vote[];

  @Column({ default: 0 })
  score: number;
  
}