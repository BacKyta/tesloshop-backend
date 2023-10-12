import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique:true
    })
    email: string;

    @Column('text',{
        select: false // si especificamos esto no regresara la contrasenia(para relaciones)
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool',{
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];


    //* Relacion entre user y producto
    @OneToMany(
        () => Product, // Lo primero es relacion el objeto de la otra entidad
        ( product ) => product.user, // se relacionaria con product.user de la otra entidad/relacion

    ) 
    product: Product // product de Tipo product con esta propiedad se relacionara desde la otra entidad.

    

    @BeforeInsert() // antes de insertar (crear)
    checkFieldsBeforeInsert() {
        this.email = this.email.toLocaleLowerCase().trim();
    }

    @BeforeUpdate() // antes de actualizar
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert();
    }
}
