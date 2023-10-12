import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Passport } from 'passport';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [ AuthService, JwtStrategy ],
  imports: [ 
    ConfigModule,

    TypeOrmModule.forFeature([ User ]),

    // Authenticacion jwt/passport
    // Usamos el modulo y el tipo de estrategia usaremos para la autrenticacion (registrar)
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports:[ ConfigModule ],
      inject: [ ConfigService ], //inyectar 

        useFactory: ( configService: ConfigService ) => { // se manda a llamar cuando se intente registrar de manera asyncrona el modulo
          //console.log('JWT Secret', configService.get('JWT_SECRET')); // viene del configService
          //console.log('JWT Secret', process.env.JWT_SECRET); // viene de la variable de entorno
          
          return{
            secret: configService.get('JWT_SECRET'), 
            signOptions: {
              expiresIn: '2h'
            }
          }
        } 
    })

    //MODE syncrono
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET, // llave secreto para firmar los jwt
    //   signOptions:{
    //     expiresIn: '1h'
    //   }
    // })

  ],
  exports:[ TypeOrmModule, JwtStrategy, PassportModule, JwtModule ]// si se necesita usar la entidad(es) fuera de este modulo
})
export class AuthModule {}



//! Configuracion de manera asyncrona
//* El problema puede ser que la variable de entorno no este definida cuando al app este montandose,
//* entonces seria mejor que este modulo sea montado de manera asincrona y asi asegurarme de tener un valor aqui
