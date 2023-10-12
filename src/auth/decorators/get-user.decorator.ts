import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator( // obtiene el usuario del token que se pasa en la request
    ( data: string, ctx: ExecutionContext ) => {
        // console.log({ ctx });
        console.log(data);
        
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if( !user )
            throw new InternalServerErrorException('User not found (request)') 
        // si mando a solicitar el usuario y no esta dentro de una ruta autenticada, osea pasada por el guard,
        // que es el que valida la request con al strategy que usamos, este  va fallar y sera un error del 
        // backend

        return ( !data ) ? user : user[data]; // la data es lo que se le pasa al deccorador()
        
    }
);

//! La request proviene de lo que se manda en el endpoint, osea la direccion del endpoint a la que solicita
//! y en este caso el token que esta en el header de la request de ahi se extrae y se devuelve el usuario.


//* El execution Contextm es el contexo en el cual se esta ejecutando al funcion eneste momento, como
//* se encuentra Nest en este momento de al app, y tenemos acceso a la request.