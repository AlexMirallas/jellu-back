import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity'; 

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 }) // e.g., 'create:post', 'delete:user:self', 'moderate:subreddit'
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}