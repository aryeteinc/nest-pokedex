import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


//La clase debe ser un Schema de Mongoose
//y debe extender de Document
@Schema()
export class Pokemon extends Document{
    //Definimos los restrictores de los campos en la base de datos
    //Esto es a nivel de Mongoose
    @Prop({
        unique:true,
        index:true
    })
    name:string;

    @Prop({
        unique:true,
        index:true
    })
    no:number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
