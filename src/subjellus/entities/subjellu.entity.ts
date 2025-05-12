import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 
import { Post } from '../../posts/entities/post.entity'; 
import { Category } from './category.entity'; 

@Entity('subjellus')
export class Subjellu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 }) 
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  bannerImage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  iconImage: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  

  // --- Relationships ---

  
  @ManyToOne(() => User, user => user.createdSubjellus, { nullable: false })
  creator: User;

  // Users who moderate this Subjellu (Many-to-Many)
  @ManyToMany(() => User, user => user.moderatedSubjellus)
  @JoinTable({ 
    name: 'subjellu_moderators',
    joinColumn: { name: 'subjelluId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  moderators: User[];

  
  @ManyToMany(() => User, user => user.subscribedSubjellus)
  @JoinTable({
    name: 'subjellu_subscribers',
    joinColumn: { name: 'subjelluId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  subscribers: User[];

  
  @OneToMany(() => Post, post => post.subjellu)
  posts: Post[];

  
  @ManyToMany(() => Category, category => category.subjellus)
  categories: Category[];
}