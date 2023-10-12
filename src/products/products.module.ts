import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    //Registra las entidades en el modulo productModule y al hacer la conexion
    // a Postgres mediante TyORM, en la configuracion global las lee, porque esta tmb esta dentro
    // del modulo(ProductsModule) que fue cargado en el appModule
    TypeOrmModule.forFeature([ Product, ProductImage ]),
    AuthModule // ahora con esto podemos proteger todas nuestras rutas en producto
  ],
  exports:[ 
    ProductsService,
    TypeOrmModule
  ], //es bien comun exportar tmb el TypeModuleORM para trabjar desde otros modulos con el repository(entidades) 
})
export class ProductsModule {}



//* Si se quiere exportar la entidad se usa exports: esto permite que la entidad se use en otro modulo
//! No es necesario usar exports para poder exportarla al app.module porque ya se cargan con el decorardor
//! dentro de la clase, y toda esta se imparta al app.module, puediendo asi cargar la entidad
//! segun la cinfiguracion global del ORM o conexiona DB.