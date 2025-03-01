import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    }catch(error){
      this.handleException(error);
    }
  }

  async findAll() {
    //neceito devolver todos los pokemons
    const pokemons = await this.pokemonModel.find();
    return pokemons;    
  }

  async findOne(term: string) {

    let pokemon: Pokemon|null = null;

    //Busqueda por no
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    //Busqueda por mongoid
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findOne({_id: term})
    }

    //Entonces es por nombre
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()})
    }

    if(!pokemon) throw new NotFoundException(`Pokemon Not Found`)
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    //Primero buscamos el pokemon
    const pokemon = await this.findOne(id);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }    
    
    try{      
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};  
    
    }catch(error){
      this.handleException(error);
    }
    
    
  }

  async remove(id: string) {
    //Primero buscamos el pokemon
    // const pokemon = await this.findOne(id);
    // return pokemon.deleteOne();    
    // return ({id});

    const {deletedCount, acknowledged} = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0) throw new NotFoundException(`Pokemon Not Found`);
    const result = acknowledged ? {id, deleted: true} : {id, deleted: false};
    return result;
  }

  private handleException(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon Exist in DB ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error)
    throw new InternalServerErrorException(`Can't create Pokemon - Check Server log`);
  }
}
