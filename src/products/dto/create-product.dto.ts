import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional,
         IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty()
    @IsString({each: true}) //cada uno tiene que cumplir que sea un string
    @IsArray()
    sizes: string[];

    @ApiProperty()
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty()
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[];

    @ApiProperty()
    @IsIn(['men','women','kid', 'unisex'])
    gender: string;
}

//! Cuando se usa la entidad para crar e insertar en la DB, al pasar la info en el DTO, y al ser algunas
//! opcionales, las que no se pasen en el DTO se grabaran en la entidad como NULL si esta marcado
//! como is Nullable, pero si no dara error diciendo que se requiere este campo para la grabacion

//? Al actualizar es diferente porque ya existe una propiedad ahi y solo modifica y transgorma
//? con los _ si este se pone en el body de la request