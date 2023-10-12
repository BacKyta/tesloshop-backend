import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';


// escucha el endpoint http://localhost:3000/socket.io/socket.io.js, con esto se conecta el cliente al 
// server webSocket, cuando se conecta un nuevo cliente desde el front este manda su informacion a este
// endpoint del server, se genera un objeto cliente, con su ID y toda su informacion que pansan, a ser
// manejados por los metodos de WebSocketGateway.


@WebSocketGateway({ cors: true }) 
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server; // tiene la informacion de todos los clientes conectados, podemos usarlo para notificar a todo el mundo.
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
    ) {}

    //* ESCUCHAR CONECCION
  //Escucha la conexion de un nuevo cliente el servidor y lo maneja con este metodo y su servicio
  async handleConnection(client: Socket) {
    //* Recibir el token de los headers del cliente al momento de hacer la conexion
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload
    try {
      //verificar el jwt sea valido con el modulo de AuthModule donde se encuentra exportando el JWTModule
      // que contiene su servicio jwtService para firmar verificar, etc los tokens
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id ); // aqui puede lanzar un error y si sucede lo desconecto en el catch
    } catch (error) {
      client.disconnect()
     return; 
    }
    //console.log({ payload });
    // console.log('Cliente conectado: ', client.id); // este id de conexion es bien volatil
    
    // Emitimos evento desde el servidor con los id de los clientes que se conectaron. (a todos)
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  //* ESCUCHAR DESCONECCION
  //Escucha la desconeccion del cliente con el servidor y lo maneja con este metodo y su servicio
  handleDisconnect(clientId: Socket) {
    // console.log('Cliente desconectado: ', client.id);
    this.messagesWsService.removeClient( clientId.id );
    // Emitimos evento desde el servidor con los id de los clientes que se desconectaron. (a todos)
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  //* ESCUCHAR EVENTOS DEL CLIENTE
  //Nest nos da un decorador para escuchar eventos(menssages) que vienen desde el cliente y una hacer logica 
  // especifica cuando se recibe un evento en particular, este decorador va esperar el nombre del evento que
  // queremos estar escuchado.

  //cuando trabajamos con este decorador tenemos acceso a 2 cosas el socket que es el cliente que emite el
  // evento, y payload que puede ser cualquier cosa.
  @SubscribeMessage('message-from-client') 
  onMessageFromClient( client: Socket, payload: NewMessageDto){
    // console.log( client.id, payload );
    //! Emitir solo a la persona que envio el mensaje (a si mismo)
    // client.emit('message-from-server',{
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message!!'
    // })
    // //! Emitir a tdos menos al cliente que envio el mensaje
    // client.broadcast.emit('message-from-server',{
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message!!'
    // })
    //! Emitir a todos el mensje incluyendo al que emitio
    this.wss.emit('message-from-server',{
      fullName: this.messagesWsService.getUserFullName( client.id ),
      message: payload.message || 'no-message!!'
    })
    //Example de enviar mensaje a ciertas personas que estan en una sala, this.wss.to('clienteID').
  }


}

//Por ejemplo cuando un cliente se conecta, podemos conectarlo a una sala client.join('ventas')
// entonces si se manda un mensaje a this.wss.to('ventas').emit('') , emitiria a todos los clientes 
// que esten en la sala de ventas.



//* http://localhost:3000/socket.io/socket.io.js , esto es justamente lo que usaremos para establecer la conexion
//*  con nuestro backendo o server webSocket, esta es la libreria con la configuracion y conexion, para
//* conctarse a nuestro servidor de webSockets.
//* Este URL le damos a un cliente para que se conecte. cuando se despliegue en la web se cambiare el 
//* local host por el dominio correspondiente.


//? Que es un SockerGateway
//* Funciona muy similar a un Controller, es el que esta pendiente de esuchar las solicitudes y emitir una 
//* respuesta, es basicamente muy aprecido con la diferencia de que el gateway realmente lo que tiene es que
//* hace una implmentacion que envuelve la implementacion propia de socker.io o ws.

//* Es como un controlador con la unica diferencia que su decorador el WebSocketGateway.
//* "Con esta configuracion del WebSocketGateway pordemos estar escuchando, clientes que se conectan, 
//* acceso al ws server, etc"

//! Basicamente lo vamos ausar como usabamos un controller.

//? Namespace
//* Podria verse como una sala de chat(ambito que contiene un conjunto de objetos relacionados), es la 
//* habitacion o la sala donde se agrupan los clientes que escucharan al servidor.

//* Cuando el cliente se conecta a una sala o namespace, este se conecta a esta y tmb a una sala personal
//* con el nombre de ese ID que tiene el cliente conectado, el cual me permite enviarle, mensajes a esa persona
//* en especifico, asi tendremos una sala genral que escucha cambios, y otra personal.

//? Sabes si un Cliente se conecta y desconecta
//* Utilizando o implmentando estas 2 interfaces  OnGatewayConnection, OnGatewayDisconnect, puedo saber
//* cuando un clinete se conecta y desconecta.