import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'How many rows do you need'
    })
    @IsOptional()
    @IsPositive()
    //Transformar
    @Type( () => Number ) // enableImplicitConvertions : tru en el main tmb se pued ehacer global
    limit?: number;
    
    @ApiProperty({
        default: 0,
        description: 'How many rows do you want to skip'
    })
    @IsOptional()
    @Min(0)
    @Type( () => Number )
    offset?: number;
}