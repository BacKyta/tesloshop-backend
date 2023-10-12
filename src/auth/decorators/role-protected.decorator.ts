import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';


//Aqui se expecifica en un solo lugar el nombre que tendra los validRoles, o meta roles.
export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {


    return SetMetadata(META_ROLES, args); 
    // es lo mismo que usar el decorador metadata, pasamos el nomvre y sus valores que tendra que luego 
    // se validan en el guard con el includes
}


//* Creamos un decorador personalizado para setear la metadata en lugar de usar en duro el @SetMetadata