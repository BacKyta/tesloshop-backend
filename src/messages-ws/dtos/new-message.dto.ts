//Apenas se tenga el codigo para forzar mediente el class validator se actualizara esta clase.

import { IsString, MinLength } from "class-validator";

export class NewMessageDto {

    @IsString()
    @MinLength(1)
    message: string;

}