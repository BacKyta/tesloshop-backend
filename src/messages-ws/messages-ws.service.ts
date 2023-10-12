import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}


@Injectable()
export class MessagesWsService {

    //Crear un lugar donde se va alamcenar todos los sockets y luego los identifico
    private connectedClients: ConnectedClients = {};

    //Inyeccion del Repository Para validar el suaurio contra la DB, si esta activo o no
    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>
    ) {}
    
    // al haacer objeto.propiedad(id) se guardan dentro del objeto id= Sokcet
    async registerClient( client: Socket, userId: string ) {

        const user = await this.userRepository.findOneBy({ id: userId })
        if( !user ) throw new Error('User not found');
        if( !user.isActive ) throw new Error('Use not active');

        this.checkUserConnection( user );

        this.connectedClients[client.id] = {
            socket: client,
            user: user,
        };
    }
    
    removeClient( clientId: string ){
        delete this.connectedClients[clientId]
    }

    getConnectedClients(): string[] {
        // console.log(this.connectedClients);
        return Object.keys( this.connectedClients ); // retorna los id (key) de los clientes conectados
    }


    getUserFullName( socketId: string ){
        return this.connectedClients[socketId].user.fullName // obtiene el fullName del objeto guardado
    }

    private checkUserConnection( user: User ) {

        for (const clientId of Object.keys( this.connectedClients )) {
            const connectedClient = this.connectedClients[clientId];

            if( connectedClient.user.id === user.id ){
                connectedClient.socket.disconnect(); // lo desconectamos si el id es el mismo
                break;
            }
        }
    }
}
