import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //* REGISTRAR USUARIO
  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  //* LOGIN USUARIO
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login( loginUserDto );
  }

  //* CHECK AUTH STATUS (Refrescar el Token o revalidarlo)

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus( user ) //sera este user todo lo que necesitemos para generar un nuevo jwt
  }








  // Probar, Asegurase de que el jwt este presente en el header con bearer token, adicinamlement podamos 
  // encontrar un suario que este activo y que el token no ha expricado.
  
  @Get('private')
  @UseGuards( AuthGuard() ) // auth Guard usa la congfiguracion o estrategia que definimos por defecto y hace el proceso de manera automatica
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders // similar a la anterior, para ver que se puede hacer, pero hay algunas diferencias, puyede que sirva esta respuesta.
  ){

    //console.log(request); // Esta es una manera de obtenerlo por la reequest, pero es mejor hacerlo mediante un decorador personalizado

    return {
      ok: true,
      message: `Hola mundo Pirvate`,
      user: user,
      userEmail,
      rawHeaders,
      headers

    }
  }

  
  @Get('private2')
  //@SetMetadata('roles',['admin','super-user']) // para decir que privateroute2 necesita ciertos roles. establecemos la metadata
  @RoleProtected( ValidRoles.superUser )
  @UseGuards( AuthGuard(), UserRoleGuard ) // Una vez inyectado como provider la strategy el AuthGuard lo lee autoamticamente y lo usa, es decir la strategy de verificar el token y la clave, etc
  privateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }


  //* COMPOSICION DE DECORADORES
  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser )
  privateRoute3(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }

}



//! METADATA, sirve para anaidir informacion extra al metodo o controlador que y quiero ejecutar

//* Para hacer turas provadas o que tiene que esperar algo, es este caso el JWT, haremos uso de los Guards
//* que son usados para permitir o prevenir acceso a una ruta.

//? Aqui es donde podemos realizar la autenticacion y autorizacion.

//* El guard que tiene una () es de la libreria passport, es una funcion que regresa unca instancia y la usa
//* pero si son guard personalizados lo vamos a usar sin crear la instancia, porque queremos que use
//* la misma instancia. Usualmente se recomienda no crear instancias hasta donde sea posible.

//! Se usar muy poco el @SetMetadata, porque es muy volatil la unfo que ponemos como parameteos ahi,
//? En su lugar usemos un decorador personalizado para tener mas control, establecer el arerglo de los roles
//? creando una enumeracion que nos ayude a evitar errores de escritura.
