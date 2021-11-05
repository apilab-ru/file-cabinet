import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { Film, Genre, SearchRequestResult } from '../../api';
import { Observable } from 'rxjs';
import { fileCabApi } from '@shared/services/file-cab.api';

@Injectable({
  providedIn: 'root',
})
export class FilmsService {

  private readonly keyGenres = 'cache_genres-films';
  private readonly keyMovie = 'cache_movie';
  private readonly keyTv = 'cache_tv';

  constructor(
    private cache: CacheService,
  ) {
    this.cache.register<Genre[]>(
      this.keyGenres,
      fileCabApi.loadFilmGenres.bind(this),
    );

    this.cache.register<SearchRequestResult<Film>>(
      this.keyMovie,
      fileCabApi.searchFilm.bind(this),
    );

    this.cache.register<SearchRequestResult<Film>>(
      this.keyTv,
      fileCabApi.searchTv.bind(this),
    );
  }

  findMovie(name: string): Observable<SearchRequestResult<Film>> {
    return this.cache.get<SearchRequestResult<Film>>(this.keyMovie, name);
  }

  findTv(name: string): Observable<SearchRequestResult<Film>> {
    return this.cache.get<SearchRequestResult<Film>>(this.keyTv, name);
  }

  getGenres(): Observable<Genre[]> {
    return this.cache.get<Genre[]>(this.keyGenres);
  }
}
