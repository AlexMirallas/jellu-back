import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('votes')
@Unique(['user', 'post', 'comment']) // Ensure a user can only vote once per post/comment
export class Vote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' }) // 1 for upvote, -1 for downvote
    value: number;

    @ManyToOne(() => User, user => user.votes, { nullable: false, onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Post, post => post.votes, { nullable: true, onDelete: 'CASCADE' })
    post: Post | null;

    @ManyToOne(() => Comment, comment => comment.votes, { nullable: true, onDelete: 'CASCADE' })
    comment: Comment | null;
}