import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity'; // Adjust path
import { User } from '../../users/entities/user.entity'; // Adjust path

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 }) // e.g., 'ADMIN', 'USER', 'SUB_MODERATOR'
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Permission, permission => permission.roles, { cascade: true, eager: true }) // Eager load permissions with roles
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ManyToMany(() => User, user => user.roles) // Link back to User
  users: User[];
}