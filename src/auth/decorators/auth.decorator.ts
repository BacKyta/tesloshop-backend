
//* Generar Composicion de Decoradores (custom)


import { UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

//? Si no recibe ningun role mi guard lo deja pasar porque no necesita ningun role para permitir el acceso.

export function Auth(...roles: ValidRoles[]) { // rest Operator, reune varios elemenros en un solo array
    
    
  return applyDecorators(

    RoleProtected( ...roles ), // spred operator
    UseGuards( AuthGuard(), UserRoleGuard ), // Auth guard hace la validacion de la estrategia de manera automatica(token)
  );
}

//* Regresamos el resultado de applyDecorators, que es la composicion de decoradores y guards con las interface
//* para hacer la validacion de la ruta.