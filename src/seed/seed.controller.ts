import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //@Auth( ValidRoles.admin ) // de esta manera solo personas administradoras pueden ejecurar el seed
  executeSeed() {
    return this.seedService.runSeed();
  }
}

//* Agregamos  validacion a nuestro seed, para esto debemos exportar e importart los modulos correespondientes
//* que se utilizan como el passport y el modulo que los contiene que es el authModule.