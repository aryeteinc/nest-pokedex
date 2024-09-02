import { BadRequestException,Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    //Inyectar el modelo de datos
    @InjectModel(Pokemon.name) 
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    //Insertar en mongoDB
    try{
    const createdPokemon = await this.pokemonModel.create(createPokemonDto);    
    return createdPokemon;
    } catch (error){
      this.handleError(error);
    }
  }

  async findAll() {
    let pokemons: Pokemon[];
    //obtener todos los pokemons
    pokemons = await this.pokemonModel.find();
    return pokemons;
  }

  async findOne(term: string) {
    let pokemon:Pokemon;

    //Buscar por no 
    if( !isNaN(+term)){
        pokemon = await this.pokemonModel.findOne({no: term});
    }

    //Buscar por MongoID
    if(isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    //Buscar por nombre
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()});
    }
    
    if(!pokemon) throw new NotFoundException(`Pokemon with term ${term} not found`);
    return pokemon;
    // return `This action returns a #${id} pokemon`;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    updatePokemonDto.name && (updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase());

    // Actualizar en mongoDB y retornamos el objeto actualizado new:true
    //const UpdatePokemonDto = await pokemon.updateOne(updatePokemonDto, {new: true});
    try{
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};
      }catch(error){
        this.handleError(error);    
      }
  }

  async remove(id: string) {
    // let eliminatedPokemon:Pokemon;
    // eliminatedPokemon = await this.findOne(id);
    // if(!eliminatedPokemon) throw new NotFoundException(`Pokemon with term ${id} not found`);

    // try{
    //   await eliminatedPokemon.deleteOne({no: eliminatedPokemon.no}); 
    //   return {...eliminatedPokemon.toJSON()};
    // }catch(error){

    // }

    //const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount, acknowledged } = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0) throw new BadRequestException(`Pokemon with term ${id} not found`);
    return deletedCount;

  }

  private handleError(error: any) {
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon already exists in db ${JSON.stringify(error.keyValue)}`); 
    }else{
      throw new InternalServerErrorException('Error check the server logs');
    } 
    return;
  }
}
