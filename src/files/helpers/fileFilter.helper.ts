//* Validar que solo pasen imagenes, no otra cosa.

//Tiene que tener un aspecto para poder utilizar en las opciones del FileInterceptor
export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {
    // console.log({ file });

    // Si no exite mandamos un erro, y un false que indica que no aceptamos el archivo
    if( !file ) return callback( new Error('File is empty'), false );

    const fileExtension = file.mimetype.split('/')[1];
    const validExtesion = ['jpg','jpeg','png','gif'];

    if( validExtesion.includes( fileExtension ) ){
        return callback( null, true)
    }

    return callback( new Error('File is not valid'), false )
    // return callback( new BadRequestException('Make sure that the file is an image'), false )
    //Se puede colocar tmb una bad request si se quiere enviar algo que no sea una imagen para atrparlo.

}

//! Esto no lanza una excepcion por parte de Nest, esto es solo para aceptar o no un archivo.