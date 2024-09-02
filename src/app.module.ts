import { join } from 'path';

import { Module } from '@nestjs/common';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';

import { ServeStaticModule } from '@nestjs/serve-static';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    PokemonModule,

    ServeStaticModule.forRoot({
      rootPath: join(__dirname ,'..','/public'),
    }),
    //Esta es la cadena de conexion a la Base de Datos
    MongooseModule.forRoot('mongodb://localhost:27017/nest_pokemon'),
    CommonModule,
  ],
})
export class AppModule {}
