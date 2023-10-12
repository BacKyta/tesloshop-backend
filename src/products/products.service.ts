import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  // Para manejar error, mensajes mas cortos
  private readonly logger = new Logger('ProductsService');

  constructor(
    //Inyectar nuestro repositorio(viene en Nest un decorador)
    @InjectRepository(Product) // relacionamos la entidad con el repo que desamos inyectar, aqui decimos que podemos inyectar en este servicio, con este decorador
    private readonly productRepository: Repository<Product>, // aqui inyectamos la dependencia 

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource, 
    // el DataSource, sabe cual es la conexion de DB, sabe que usuario uso, la misma config que el repository
  ){}

  //* CREATE
  async create(createProductDto: CreateProductDto, user: User) {
    //Usando el patron repositorio, el repo es elq ue se va encargar de hacer esas interacciones con la DB
    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({ // solo crea la instancia del producto con sus propiedades, y el id
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image })),  //! Leer cascade: true
        user: user
        // crear instancias de nuestro productImage y las guarda con el save (abajo) en su tabla.
        //? Cuando se grabe esto TypeORM va saber que el id que se grabe en producto, va ser el Id de la
        //? relacion que tenga el productImage
      }) 
      await this.productRepository.save(product); // impactamos la DB, con cascade en true en cascda se graba segun la relacion
      return { ...product, images };

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }


  //* BUSCAR TODOS
  async findAll( paginationDto: PaginationDto) {

    const {limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO : Relaciones
      relations: {
        images: true, //llena las imagenes, de la relacion cuando se haga el find
      }
    });

    //Aplanar las imagenes de los productos retornados
    return products.map( ({images, ...rest }) => ({
      ...rest,
      images: images.map( img => img.url )
    }));

  }

  //* BUSCAR POR TERMINO
  async findOne(term: string) {

    let product: Product;

    if( isUUID( term )){

      product = await this.productRepository.findOneBy({ id: term }); 
      //! en findOneBy no se tiene la condicion de relation con en el find(), para estyo usar Eager(TypeORM)
      //! Carga todas las relaciones autimaticamente con el eager, en este caso las imagenes, esto funciona
      //! con todos los find*, pero si se usa el queryBuilder no funciona, para esto usar el leftJoinAndSelect
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, { 
          // el slug se graba siempre en minuscula
          title: term.toUpperCase(), // compara ambas en mayusculas para evitar el case sensitive
          slug: term.toLowerCase(), // podrian ser respuestas identicas pero solo regresa uno
        })
        .leftJoinAndSelect('prod.images', 'prodImages') 
        .getOne(); // para obtener uno
        //leftjoin como en SQL, indicamos el punto donde queremos hacer el left join (prod.images), y su alias.
        //Esto sirve para hacer el get mediante titulo o slug por para el ID esta el eager

        //? Tener en cuenta que cuando se usa funciones para hacer los querys se deben crear
        //? indices propio en la DB, para asegurarse de que van a buscar el UPPER del titulo, porque en 
        //? este caso ya no se estaria usando el indice. (Investigar)

      // slect * from Products where slug='XX' or title=xxxx similar a esto pero en codigo, a su vez
      // me debo asegurar que no me haa inyeccion de SQL
    }
    //console.log(product); // da null si no es uuid busca el termino de busqueda en slug
    
   if(!product ) // !null = true
    throw new NotFoundException(`Product with ${ term } not found`);

    return product;
  }

  // funcion intermedia que usa el findOne de arriba
  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );
    return{
      ...rest,
      images: images.map( image => image.url )
    }
  }


  //*UPDATE
  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id, // busca un producto por el ID
      ...toUpdate, // carga todas la propiedades en este DTO. a este objeto
    });

    //Si el producto no se encuentra regresa null, y entraria en esta condicion
    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found`);

    //Create query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
   
    try {

      //borrar las imagenes anteriores e insertar las nuevas
      if( images ){
         //sofdelete marca como activo o inactivo para integridad referencial
        await queryRunner.manager.delete( ProductImage, { product: { id } } ) //! tener cuidado con el cruterui de eliminacion(select * from sin una condicion)
        // Borramos todas las productImages cuya columna productID, sea igual al id, recordar que la relacion
        // de product se creala la columna productId

        //Sobreescribir o setar las nuevas imagenes
        product.images = images.map( 
          image => this.productImageRepository.create({ url: image })
        ); // regresa vacio[] si no hay images en el DTO, por eso se eliminar las anteriores, y sus
        // relaciones y se coloca las nuevas en este casi serian vacias

      }else{
        // Cuando no hay images, tenemos que cargarlos de alguna manera
        // pero no seria necesario, si no viene la propiedad images, sale de este if y pasa a aplanar
        // y retornar las imagenes de ese ID, pero si se manda un [] vacio ahi si entrea aqui
      }

      // Intenta grabarlo aun no se hace el Commit, puede fallar el delete o el save, entonces
      // se hace un rollback
      product.user = user; // actualizamos el usuario
      await queryRunner.manager.save( product );

      await queryRunner.commitTransaction(); //hace el commit
      await queryRunner.release(); // liberar el runner despues de hacer el commit, desconectamos.

      //await this.productRepository.save( product );// solo guarda o actualiza lo que se paso en el body

      return this.findOnePlain(id);

    } catch (error) {

      await queryRunner.rollbackTransaction(); // regresamos los cambios
      await queryRunner.release();
      this.handleDBExceptions(error); // sies que al actualizar se viola una llave primaria o constrains manejamos el error
    }

  }

  //* DELETE
  async remove(id: string) {
    const product = await this.findOne(id); //usamos el de buscar primero, metodo anterior
    await this.productRepository.remove( product );
    return;
  }


  // Metodo privado para manejar los errores de manera global y unica para no repetir codigo
  private handleDBExceptions( error: any ){

    if( error.code === '23505' )
    throw new BadRequestException(error.detail)
  this.logger.error(error);
  throw new InternalServerErrorException('Unexpected errors, check server logs')
  }


  //* DELETE PARA SEMILLA
  //Metodo destructivo para usar mi semilla o en desarrollo, en produccion, no usar.
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      //delete de todos los registro de todo lo que tengo en la tabla producto, cuando borre uno en cascada
      //se borran todos, incluidos sus imagenes.
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}



//* El  @InjectRepository, puede verse similar a usar el @InjectModel para usar el modelo de Mongo
//* para insertar a la base de datos.
//* Es decir usamos la entidad producto como repositorio para inyectar en la DB

//! Pero es mas que eso crea un repositorio que genera una capa de abtraccion entra la logica de negocio
//! y la logica de acceso a la DB, esta capa, contiene los metodos para la insercion y todo el CRUD a la DB, 
//! de tal manera que solo nos preocupamos por la logica.

//? QueryRunner
//? En el queryRunner empezamos a definir una serie de procedimientos, automaticamente no va hacer
//? los commit o impactar la DB, hasta que ejecutemos literalmente el commit, si no se usa este commit
//? se lanzan errores, y si se falla la actualizacion se hace el rollback(revertir cambios).