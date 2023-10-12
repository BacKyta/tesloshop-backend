import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' }) //definir nombre para las tablas, sin afectar el nombre de la entidad
export class Product {

    //Las llaves primarias son automaticamente indexadas
    @ApiProperty({
        example: '5014ae26-c687-4475-8372-64a439cdc943',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;


    // No pueden haber 2 productos que tengan el mismo nombre
    // Se crea indice automatico.
    @ApiProperty({
        example: 'T-shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;


    @ApiProperty({
        example: '0',
        description: 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price: number;

    
    @ApiProperty({
        example: 'Mollit ex aliqua id aute ea occaecat enim ad consectetur.',
        description: 'Product Description',
        default: null
    })
    @Column({
        type:'text',
        nullable: true
    })
    description: string;


    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUF - for SEO',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    slug: string;


    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int',{
        default: 0
    })
    stock: number


    @ApiProperty({
        example: ['M','XL','XXL'],
        description: 'Product sizes',
    })
    @Column('text',{
        array: true
    })
    sizes: string[] // tamanios de prenda
    

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string


    @ApiProperty({
        example: ['women','vestido','rojo'],
        description: 'Product tags',
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]


    //Creando relaciones
    //Images
    @ApiProperty()
    @OneToMany(
        () => ProductImage, // especifica la entidad destino ala que esta relacionado
        ( productImage ) => productImage.product, // como se relaciona con la otra tabla, osea con el product.
        // productImage.product, es un objeto que contiene todas las propiedades de Product y viceseversa, asi se relacionan 
        { cascade: true, eager: true }  // eager se muestra la relacion en la respuesta del endpoint, las imagenes

        //! para elmininar o guardar, actualizar todos las imagenes relacionadas a este producto, es decir
        //! con esto al guardar una entidad nueva con sus imagenes, propagamos toda la informacion
        //! y en cascada hacemos save de sus tablas relacionadas a esta. (importante ponerlo)

        //* Especificamos la entidad a la que la vinculamos, relacionamos con la otra tabla de uno a muchos
        //* esto crea en la tabla destino la columna de la llave foranea, cuando una imagen se borra, actualiza
        //* o crea en cascada se refleja en su tabla.

        //* Como ambos estan relacionados si actualizamos el producto en cascada se actualiza(crear) sus imagenes
        //* lo mismo cuando creamos, pero si queremos eliminar un producto debemos colocar en cascda las imagenes tmb.
    
        //? Eager cada vez que usemos un metodo find* para cargar producto automaticamente carga las imagees
        //? relacionadas a este

        // usualmente no buscariamos eliminar un producto jamas, porque se debe hacer una pripiedad
        // que el producto esta activo o inactivo, por el hecho de mantener la integridad referencia.,
        // como facturas boletas, ordenes de compra, si borramos el producto, podriamos perder toda esa
        // integridad referencial.
    )
    images?: ProductImage[]; // un producto va tener michas imagenes(decorador)

    

    //* Relacion entre producto y usuario
    @ManyToOne(
        () => User,
        ( user ) => user.product, // se utiliza la propiedad como punto de refrencia
        { eager: true } // carga la columna de la relacion automaticamente cuando se consulta la entidad o tabla.
    )
    user: User // Esta es la propiedad con la cual se relaciona desde la otra entidad
    // Aqui si crea un valor nuevo en la columna, debido a la relacion , porque aqui identifica el id del producto



    //Antes de Insertar, ejecuta esto, virifica si hay slug en el DTO que se le pasa y si no lo genera.
    @BeforeInsert()
    checkSlugInsert(){
        if( !this.slug ){
            this.slug = this.title; 
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }

    @BeforeUpdate()
    checkSlugUpdate(){

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }
}




//* Sizes, aqui podriamos crear una relacion con otra tabla de Sizes, auque podria ser una propuedad
//* que puedo manejar en la columna, todos los productos tienen sizes.
//* Estas son las condiciones que se puedne evaluar para ver si se tiene una tabla nueva o no

//? Si en el caso de que este los sizes va ser nulo, osea si pensamos que este valor en muchos productos
//? va ser nulo, significa que no todos lo van a tener y para seguir las reglas de normalizacion
//? seria conveniente crear una tabla donde solo tengamos los valores, y evitemos insertar nulos en la DB.
//? pero aqui todos van a tener sizes.