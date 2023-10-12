import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService // Servicio proporcionado por el Jwt Modulo, el modulo le dira la fehca de expricarion, el secret ya configuradors en el JWTmodule

  ){}

  //* CREATE USER 
  async create(createUserDto: CreateUserDto) {
    
    try {
      const { password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 ) // sync bloquea codigo hasta que el hash este listo
      });

      await this.userRepository.save( user );
      delete user.password;
      
      //TODO : retornar el JWT
      return { 
        ...user,
        // token: this.getJwtToken({ email: user.email })
        token: this.getJwtToken({ id: user.id })
      };

    } catch (error) {

      this.handleDBErrors(error);
      
    }
  }

  //* LOGIN USER

  async login( LoginUserDto: LoginUserDto ) {

    const { password, email } = LoginUserDto;

    const user = await this.userRepository.findOne({
      // solo en el login necesito la constrasenia, cuando creo no es necesario regresarlo, por eso hago 
      // el findOne y filtro la password que fue ocualta desde la entidad con la propuedad select.
      where: { email }, // buscare el registro por email, esta indexado, es unico
      select: { email: true, password: true, id: true } // solo devuelve el email y la password y id
    })
    // console.log(user);
    
    if( !user ) // si es null el usuario
      throw new UnauthorizedException('Credentials are not valid (email)');

    if( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Credentials are not valid (password)');

      // console.log({ user });
      

    //TODO : RETONAR EL JWT
    return {
      ...user,
      // token: this.getJwtToken({ email: user.email })
      token: this.getJwtToken({ id: user.id })
    }
  }


  //* CHECK AUTH STATUS (Refrescar el Token o revalidarlo)
  async checkAuthStatus( {email, ...user}: User ){

    const password = await this.userRepository.findOne({
      where: { email },
      select: { password: true } 
    })
    return {
      ...user,
      ...password,
      token: this.getJwtToken({ id: user.id })
    };
  }



  //* OBTENER O GENERAR JWT

  private getJwtToken( payload: JwtPayload ){

    const token = this.jwtService.sign( payload ); // usa la configuracion del moldulo, genera el token en base al payload el secreto y el header en el sign
    return token;
  }


  //* MANEJARDOR DE ERRORS
  // este tipo de funciones nunca regresara un valor(never), never representa codigo que nunca se completa
  // normalmente(excepciones) , void retorna ningun valor explicito, resultado no uttilizable.
  
  private handleDBErrors( error: any ):never { 
    if( error.code === '23505' )
      throw new BadRequestException( error.detail );

      console.log(error);

    throw new InternalServerErrorException(`Please checks server logs`) // no deberia pasar
      
  }

}
