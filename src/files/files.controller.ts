import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService // configurar variables de entorno
    ) {}


  //* OBTENER IMAGEN DE ARCHIVO POR NOMBRE (URL) - retorna imagen, se usa este endpoint para url seguro
  @Get('product/:imageName')
  findProductImage(
    //regresar la imagen en lugar del path
    @Res() res: Response, // la response de express
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getStaticProductImage( imageName );

    //Con el @Res decimo que vamos a emitr la respuesta de manera manual, tener cuidado porque con esto
    // se saltan ciertos interceptores o restricciones de manera global, de esta manera controlamos
    // el archivo y podemos enviarlo como quedamos, como json o en ete caso el archivo directo.
    res.sendFile( path );
  }

  
  //* SUBIR UNA IMAGEN DE UN PRODUCTO
  @Post('product')
  @UseInterceptors( FileInterceptor('file', { // nombre de la propiedad del body que se manda
    fileFilter: fileFilter,
    //subida o guardar archivos
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    }) //fisicamente donde quiero almacenarlos
  }) ) 
  uploadProductFiles( @UploadedFile() file: Express.Multer.File ) { // Multer define el formato de la estructura del archuvo en la respuesta
    
    if( !file ){
      throw new BadRequestException('Make sure that the file is an image');
    }
    
    // const secureUrl = `${ file.filename }`;
    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`;
    // console.log({ fileInController: file });
    
    return {
      secureUrl
    };
  }

}



//? Endpoint product/:imageName
//* Con este endpouint retornamos la imagen y no directamente el url donde esta alojada, permitiendo
//* ocultar el path, asi usamos este url para acceder a la imagen y que se muestre.
//* Este url que se obtiene al crear subi una imagen de producto es lo que mandaremos para crear el 
//* producto en el array de su propiedad de la entidad


//? @UseInterceptor
//* Se usa para aplicar interceptores, interceptan las solicitudes y mutan las respuestas.
//* El FileInterptor maneja la carga de archivo de la solicitud entrante y la toma de la propiedad file.

//* El @uploadFile, se usa para inyectar el archivo cargado e interveptado antes, en el metodo.


//! Recordar que el fileFilter es solo para validar si viene o no un archivo, osea puede venir la propiedad
//! pero con archivo vacio ( propiedad opcional), entonces esto solo valida el archivo, para valir si viene
//! o no la propiedad debemos controlar la excepcion si es o no opcional la propiedad en el mismo CONTROLADOR
