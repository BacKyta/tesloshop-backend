import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from "@nestjs/common";

//Las strategies son provider por eso se debe colocar Injectable 
@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) { // clases para estrategias personalizadas, como se autentica un suaurio en la app
//Strategy sirve como plantilla para crar estretegias personalizadas
    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>,

        private readonly configService: ConfigService
    ){
        // usa propiedades del padre para configurar la estrategia de autenticacion
        super({
            secretOrKey: configService.get('JWT_SECRET'),// define la clave secreta que se usara para validar el JWT
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() // en que posicion voy a esperar que me manden mi jwt, (headers, body, header de autenticacion)
        }) 
    }

    // Recibe el payload que esta dentro de jwt que se para por el BearerToken en Postman
    async validate( payload: JwtPayload ):Promise<User> {

        //? Buscar siempre usar el id por el email, por que es volatil
        const { id } = payload;

        const user = await this.userRepository.findOneBy({ id });

        if( !user )
            throw new UnauthorizedException('Token not valid'); //Cuando cambia el usuario o el correo no se identifica con el de la db y arroja null

        if( !user.isActive )
            throw new UnauthorizedException('User is inactive, talk with an admin');

            // console.log({user});
        // Con esto ya nos aseguramos de aque aunque cambiesmos el correo, gracias al ID que controlamos
        // el token seguira siendo valido, porque el ID es algo que no cambia es algo permanente.
        // Y por eso  lo usamos de payload.
            

        return user; // si la validacion pasa lo que devuelvo aqui se aniade ala Request.
        //* Lo que se pasa aqui estara en la request y se trata en el siguiente getUser personalizado(decorador)
        //* Y se retorna en la respuetsa en el mismo controlador( no se usa un servicio)
    }
}




//! Este metodo se llama solo si, el jwt no ha expirado y si la forma del jwt hace match con el payload

//* Implentar una forma de expandir la validacion del JWT, el PassportStrategy va revisar el JWT basado
//* con la palabra secreta, si no ha expirado, y la estrategia me va decir si es valida, esto es un principio.

//* Si se quiere saber si el usuario esta activo se implementa o extiende la validacion, mediante un metodo

//* Este mtodo recibe el payload del JWT,  y esta me retorna una promesa de la instancia de mi entidad
//* Usuario de la DB

//! Es decir cuando tenemos un JWT que es vigente en cuanto a ala fecha de expriracion y hace match la firma
//! con el payload, entonces aqui (en este metodo) puedo recibir este payload y puedo validar el payload
//! como yo quiera, implementar ahi mi condicion propiamente.


//? Atrapado antes de llegar al metodo personalizado
//* Si la Secret cambia todos los demas token firmados con el secreto anterior, quedan invalidos
//* El error se atrapa en el secreto cuando se valida el secreto no es el mismo, da unauhtorized
//* Si no se define el token tmb da unauhtorized.

//? Atrapado en el metodo perzonalizado
//* Si el secreto y el token estan bien pasan a comprar el payload que esta dentro del jwt, con las validaciones
//* de abajo del metodo creado