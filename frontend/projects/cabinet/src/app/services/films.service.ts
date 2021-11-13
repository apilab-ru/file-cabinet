import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { Film, SearchRequestResult } from '../../models';
import { Observable } from 'rxjs';
import { fileCabApi } from '@shared/services/file-cab.api';
import { FileCabService } from '@shared/services/file-cab.service';


@Injectable({
  providedIn: 'root',
})
export class FilmsService {
  genres$ = this.fileCabService.filmGenres$;

  private readonly keyMovie = 'cache_movie';
  private readonly keyTv = 'cache_tv';

  constructor(
    private cache: CacheService,
    private fileCabService: FileCabService,
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
