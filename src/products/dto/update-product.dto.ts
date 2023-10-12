// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// El problema es quie mapped-types por defecto no toma los decoradores de Swagger cuando se extiende del
// createProductDTO
// Pero swagger nos cubre con eso, lo toammos de swagger
export class UpdateProductDto extends PartialType(CreateProductDto) {}
