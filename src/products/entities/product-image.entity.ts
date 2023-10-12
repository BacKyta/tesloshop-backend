import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: 'product_images' })
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    //Creando relaciones
    @ManyToOne(
        () => Product, // especifica la entidad destino a ala que esta relacionada
        ( product ) => product.images, // vincula la entindad con la otra tabla(llave foranea)
        { onDelete: 'CASCADE' } // cuando el producto se Elemina, que quiero que suceda aca
        // Si borro el Product en cascada borra estas imagenes tmb.
        //* Especifica la entidad destino a la que esta relacionada, instancia, y vincula a la entidad
        //* de la otra tabla (mediante su relacion ) para hacer la llave foranea, cuando borraun product
        //* este se borra en cascara todos las imagenes relacionadas a el.
    )
    product: Product
}

//! Tecninamente el ORM crea la columna en la tabla para hacer la llave foranea en este caso, uno a muchos
//! geneta la columna en Imagenes con la cual se identifica la relacion, que es ProductID, porque con eso
//! guarda la relacion de un producto (ID) tendra muchas imagenes.