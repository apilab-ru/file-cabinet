import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { Film, Genre, SearchRequestResult } from '../../models';
import { Observable } from 'rxjs';
import { fileCabApi } from '@shared/services/file-cab.api';
import { FileCab } from '@shared/services/file-cab';

@Injectable({
  providedIn: 'root',
})
export class FilmsService {
  genres$ = this.fileCab.filmGenres$;

  private readonly keyMovie = 'cache_movie';
  private readonly keyTv = 'cache_tv';

  constructor(
    private cache: CacheService,
    private fileCab: FileCab,
  ) {
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
}
