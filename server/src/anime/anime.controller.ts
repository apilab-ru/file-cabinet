import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { Anime, Genre, SearchRequestResult } from '../api';
import { ApiImplicitQuery, ApiUseTags } from '@nestjs/swagger';
import { AnimeSearchQuery } from './interface';
import { ShikimoriApi } from './shikimori';

@ApiUseTags('anime')
@Controller('anime')
export class AnimeController {

  constructor(
    private readonly animeService: AnimeService,
    private readonly shikimoriApi: ShikimoriApi,
  ) {
  }

  @Get('search')
  @ApiImplicitQuery({
    name: 'name',
    type: 'string',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'type',
    type: 'string',
    description: 'types separated by ","',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'genre',
    type: 'string',
    description: 'genres separated by ","',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'yearseason',
    type: 'string',
    description: 'years: from{-to}, 2019 or 2018-2019',
    required: false,
  })
  async findAnime(@Query() query: AnimeSearchQuery): Promise<SearchRequestResult<Anime>> {
    let chips = { ...query };
    delete chips.name;
    return await this.animeService.search(query.name, chips).toPromise();
  }

  @Get('genres')
  async getGenres(): Promise<Genre[]> {
    return await this.animeService.getGenres().toPromise();
  }

  @Get(':id')
  @ApiImplicitQuery({
    name: 'id',
    type: 'number',
  })
  async findById(@Param('id') id: string): Promise<Anime> {
    return await this.animeService.byId(id).toPromise();
  }

  /*@Get('search-shiki')
  @ApiImplicitQuery({
    name: 'name',
    type: 'string',
    required: false
  })
  async searchShikiApi(@Query() query: any): Promise<any> {
    return await this.animeService.search(query.name, chips).toPromise();
  }*/
}
