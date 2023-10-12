
export interface JwtPayload {
    // email: string;
    id: string;

    // TODO : aniadir todo lo que quieran grabar, para validar en el strategy, procura que nos ea muy grande, porque el jwt va viajando entre el front y el back en cada una de las peticiones autenticadas.
}