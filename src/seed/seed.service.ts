import { Injectable } from '@nestjs/common';
import axios,{ AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-request.interface';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;

  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')

    data.results.forEach(({name,url}) => {
      //console.log(`Name: ${name} - URL: ${url}`);
      const no: number = +url.split('/')[6];
      console.log({no, name});
    });
    return data.results;
  }
}
