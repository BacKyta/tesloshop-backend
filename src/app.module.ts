import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';



@Module({
  imports: [
    //Config Variables de entorno
    ConfigModule.forRoot(),

    //Config DB conection
    TypeOrmModule.forRoot({
      //coneccion certificada para la nube (aprovisionamiento)
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'
        ? { rejectUnauthorized: false}
        : null
      } ,
  
      type: 'postgres',
      host: process.env.DB_HOST, //localhost o la coneccion al aporvisionamiento futuro
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true, // para cargar automaticamente las entidades que definimos.
      synchronize:true 
      // sincroniza las entidades con la DB, si creamos columna la cra en la DB, automaticamente las 
      // sincronize(produccion NO es tan conveniente, porque impactaria la DB)
    }),   

    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
      }),

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule,

    MessagesWsModule

  ],
})
export class AppModule {}

//? Configurar Archivos Staticos (public)

//* Si tenemos las imagenes estaticas y sabemos que no va cambiar, y todo el mundo puede tener acceso a ellas
//* entonces no hace falta que configuremos todo el RestFull Api endpoint de los archivos, controlador, etc

//* cuando sirvamos de manera estatica no es una buena idea colocar public/images, porque esta ruta
//* ya puede estar tomado desde otro endpoint.

//* Idealmente se deberia colocar public/assets o public/images, por ahi, pero denepende del depliegue e
//* intencion que tenga con eso.

//! Se debe decirle a nest que tome esta carpeta y la sirva como contendio estatico en el app.Module

//! OJO, debemos colocar un arcivo index.html para evitar mostrar informacion de mi path que no se encontro
//! en la carptea publica. osea el D://cursos/devtalles/public/index.html , evitemos esto.

//? Pero si accedomos al localhost/product/<nombre-imagen>, ahi si encuentra la imagen estatica, si sabemos
//? que no va cambiar las imagenes podemos usar la estrateggia de servir contenido estatico.
//? Pero asi no controlamos a quien mostramos o no estas imagenes, todos pueden acceder ya que son recursos 
//? publicos.

//* Tmb debemos usar uan forma para tener el url especifico, asi como lo tenemos en la DB, y colocar estas
//* imafenes en la carpta public.

//! Cuando se busca algo(imagen) y este no se encuentra, y tenemos configurado el Contenido Statico, este
//! endpoint buscara en esa carpeta.



//? Diferencias entre servir imagenes, osea como las queremos manejar:
//* Manejar desde mi API, con un controaldor, tener control absoluto de que usuarios van a poder ver estas 
//* imagenes, usuarios, autenticacion o si es publico, tenemos control abtolsuto(roles)

//* Publico, el problema es que no tenemos control para los usuarios que puedan ver la imagen, cosa que pueda 
//* ser util, y la ventaja es que no hay mucha configuracion solo servir la carpeta.