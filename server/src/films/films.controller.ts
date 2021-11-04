import { Controller, Get, Query } from '@nestjs/common';
import { FilmsService } from './films.service';
import { Film, SearchRequestResult, Genre } from '../api';
import { ApiImplicitQuery, ApiUseTags } from '@nestjs/swagger';
import { EFilmsSortBy, EOrderType, FilmsSearchQuery } from './interface';

@ApiUseTags('films')
@Controller('films')
export class FilmsController {

  constructor(
    private filmsService: FilmsService,
  ) {
  }

  @Get('movie')
  @ApiImplicitQuery({
    name: 'name',
    type: 'string',
    required: false
  })
  @ApiImplicitQuery({
    name: 'orderField',
    type: 'enum',
    enum: Object.values(EFilmsSortBy),
    required: false
  })
  @ApiImplicitQuery({
    name: 'orderType',
    type: 'enum',
    enum: Object.values(EOrderType),
    required: false
  })
  @ApiImplicitQuery({
    name: 'primary_release_year',
    type: 'string',
    required: false
  })
  @ApiImplicitQuery({
    name: 'with_genres',
    type: 'string',
    required: false
  })
  @ApiImplicitQuery({
    name: 'with_people',
    type: 'string',
    required: false
  })
  async findFilm(
    @Query() query
  ): Promise<SearchRequestResult<Film>> {
    const chips = {...query};
    const orderField = chips.orderField;
    const orderType = chips.orderType;
    delete chips.name;
    delete chips.orderField;
    delete chips.orderType;
    return await this.filmsService.searchMovie(
      query.name, chips, orderField, orderType
    ).toPromise();
  }

  @Get('tv')
  @ApiImplicitQuery({
    name: 'name',
    type: 'string',
    required: false
  })
  @ApiImplicitQuery({
    name: 'orderField',
    type: 'enum',
    enum: Object.values(EFilmsSortBy),
    required: false
  })
  @ApiImplicitQuery({
    name: 'orderType',
    type: 'enum',
    enum: Object.values(EOrderType),
    required: false
  })
  @ApiImplicitQuery({
    name: 'primary_release_year',
    type: 'string',
    required: false
  })
  @ApiImplicitQuery({
    name: 'with_genres',
    type: 'string',
    required: false
  })
  @ApiImplicitQuery({
    name: 'with_people',
    type: 'string',
    required: false
  })
  async findTv(
    @Query() query
  ): Promise<SearchRequestResult<Film>> {
    const chips = {...query};
    const orderField = chips.orderField;
    const orderType = chips.orderType;
    delete chips.name;
    delete chips.orderField;
    delete chips.orderType;
    return await this.filmsService.searchTv(
      query.name, chips, orderField, orderType
    ).toPromise();
  }

  @Get('genres')
  async loadGenres(): Promise<Genre[]> {
    return await this.filmsService.getGenres().toPromise();
  }

}
