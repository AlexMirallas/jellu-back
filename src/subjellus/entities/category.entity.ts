import { Column, JoinTable, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany } from "typeorm";
import { Subjellu } from "./subjellu.entity"; // Adjust the import path as necessary

@Entity({ name: "categories" })
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 50 })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @ManyToOne(() => Category, category => category.children, {
        nullable: true, 
        onDelete: 'SET NULL' 
    })
    @JoinColumn({ name: 'parentId' }) 
    parent: Category | null

    @Column({ name: 'parentId', type: 'uuid', nullable: true }) 
    parentId: string | null;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];

    @ManyToMany(() => Subjellu, subjellu => subjellu.categories)
    @JoinTable({
        name: 'subjellu_categories',
        joinColumn: { name: 'categoryId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subjelluId', referencedColumnName: 'id' }
    })
    subjellus: Subjellu[]

}
