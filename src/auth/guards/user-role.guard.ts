import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';

//? Este Guard se encarga de ver el usuario y ver si ese usuario tiene los roles pero antes de llegar a 
//? evaluar el usuario necesito tener la metadata(Reflector) que estoy estableciendole aqui.
@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    //roles que se pasaron como parametro al setMetadata y lo obtenemos de ahi con el reflector( del contexto)
    const validRoles: string[] = this.reflector.get( META_ROLES, context.getHandler() )
    // console.log({validRoles}); 

    if( !validRoles ) return true; // si no exiten roles, cualquiera puede entrar, no hay restriccion

    if( validRoles.length === 0 ) return true; // viene un arreglo pero viene vacio, no se configuro ningun role

    // con esto comparamos si uno de estos roles los tiene o existen dentro del arreglo del usuario,
    // si tiene uno de los roles lo dejo pasar, pero si no se regresa un error.


    //Obtener roles del usuario, de la request que paso por el authguard(del context)
     const req = context.switchToHttp().getRequest();
     const user = req.user;

     if( !user )
      throw new BadRequestException('User not found');

      //console.log({ userRoles: user.roles }); // se obtienen los roles del usuario

      //Evaluemos cada uno de los roles si estan dentro del validRoles para dar el acceso

      for ( const role of user.roles ) {
          if ( validRoles.includes( role ) ) {
            return true;
          }
      }
      
      throw new ForbiddenException(
        `User ${ user.fullName } need a valid role: [${ validRoles }]`
      )
  }
}



//* Para que un Guard se valido tiene que implementar el metodo canActivate, este tiene que regresar un
//* boolena si es tru edeja pasar si no lo rechaza, o una promesa que resuelva un boolean, los guard 
//* por defectro son asyncronos o un Observable que emita un valor booleano.

//! Si retrona falso regresa un 403- no pudo entrar al recurso.

//? La idea del Reflector es que me va ayudar a ver informacion de los decoradores y de la metdata del mismo
//? metodo o donde este puesto.