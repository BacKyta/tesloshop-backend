import { v4 as uuid } from 'uuid'

//* Validar y cambiar el nombre del archivo.

//Tiene que tener un aspecto para poder utilizar en las opciones del FileInterceptor
export const fileNamer = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {
    // console.log({ file });

    // Aqui ya deberiamos tener un nombre luego de haber subido el archivo, se deja esta validacion porseaca
    if( !file ) return callback( new Error('File is empty'), false );

    const fileExtension = file.mimetype.split('/')[1];

    const fileName = `${ uuid() }.${ fileExtension }`;
    
    callback(null, fileName);
}
