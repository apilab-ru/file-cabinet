import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import { Film, SearchRequestResult, Genre } from '../../api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilmsService {

  private readonly keyGenres = 'cache_genres-films';
  private readonly keyMovie = 'cache_movie';
  private readonly keyTv = 'cache_tv';

  constructor(
    private api: ApiService,
    private cache: CacheService,
  ) {
    this.cache.register<Genre[]>(
      this.keyGenres,
      this.loadGenres.bind(this)
    );

    this.cache.register<SearchRequestResult<Film>>(
      this.keyMovie,
      this.loadFindMovie.bind(this)
    );

    this.cache.register<SearchRequestResult<Film>>(
      this.keyTv,
      this.loadFindTv.bind(this)
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

  private loadGenres(): Observable<Genre[]> {
    return this.api.get<Genre[]>(`films/genres`);
  }

  private loadFindMovie(name: string): Observable<SearchRequestResult<Film>> {
    return this.api.get<SearchRequestResult<Film>>(`films/movie`, {name});
  }

  private loadFindTv(name: string): Observable<SearchRequestResult<Film>> {
    return this.api.get<SearchRequestResult<Film>>(`films/tv`, {name});
  }
}
