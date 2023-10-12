import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';



@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository< User > // repository facilita la interaccion con la DB

  ){}

  //* EJECUTAR EL LA SEMILLA QUE ELIMINA Y LUEGO INSERTA
  async runSeed(){
    await this.deleteTables()
    //insertar usuarios
    const adminUser = await this.insertUsers();
    // console.log(adminUser);
    
    //Insertar productos
    await this.insertNewProducts( adminUser );
    return 'SEED EXCUTED';
  }

  
  //* Borrar la DB en cierto orden para evitar la violacion relaciones
  private async deleteTables() {
    // Borrar primero los productos porque mantien la integridad referencias con los usuarios, si no hay 
    // productos relacionados ya puedo borrar el usuario.
    await this.productService.deleteAllProducts();

    // Eliminar todos los usuarios
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
    .delete()
    .where({})
    .execute()
  }

  //* INSERTAR USUARIOS
  private async insertUsers() {

    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( ({password, ...user}) => {
      users.push( this.userRepository.create({
        ...user,
        password: bcrypt.hashSync( 'Abc123', 10 )
      }) ) //crea pero no guarda, en syncrono crea el id y lo prepara
    })
    
    await this.userRepository.save( users ) // aqui correccion de codigo con el video
    console.log(users); // despues de salvar se genera su id automatico

    return users[0]; // retorna el usuario primero, este sera el usuario con el que se creen todos los productos
  }


  //* INSERTAR NUEVO PRODUCTO
  private async insertNewProducts( user: User ) {

    this.productService.deleteAllProducts()

    const products = initialData.products // luce como el DTO lo se la data ficticia.

    const insertPromises = [];
 
    products.forEach( product => {
      // no da error porque a luce como algo establecido en el DTO, usamos el metodo create del servicio exportado
      insertPromises.push( this.productService.create( product, user ) );
    });

    // console.log(insertPromises);
    
    await Promise.all( insertPromises ); 
    // todas las primesas se ejecutan en paralelo, espera a que todas terminen, si una falla es 
    // atrapada en la excepcion del create
    
    // console.log(insertPromises);

    return true;
  }
}

//! REPOSITORY

//* Un Repository es una clase generada por TypeORM que proporciona métodos y funcionalidades para 
//* interactuar con la base de datos en relación con una entidad específica. Estos métodos incluyen 
//* operaciones CRUD (Crear, Leer, Actualizar, Eliminar) y permiten acceder y manipular datos en la base 
//* de datos relacionados con la entidad a la que pertenecen.

//* Es una clase proporcionada por TypeORM que se genera automáticamente para cada entidad que definas en 
//* tu aplicación. 

//? userRepository es una instancia de Repository vinculado a User y puede usar sus metodos y propiedades