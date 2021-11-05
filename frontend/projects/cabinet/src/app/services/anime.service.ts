import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { Anime, Genre, SearchRequestResult } from '@server/api/index';
import { Observable } from 'rxjs';
import { fileCabApi } from '@shared/services/file-cab.api';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {

  private readonly keyGenres = 'cache_genres-anime';
  private readonly keyAnime = 'cache_anime';

  constructor(
    private cache: CacheService,
  ) {
    this.cache.register<Genre[]>(
      this.keyGenres,
      fileCabApi.loadAnimeGenres.bind(fileCabApi),
    );

    this.cache.register<Anime[]>(
      this.keyAnime,
      fileCabApi.searchAnime.bind(fileCabApi),
    );
  }

  findAnime(name: string): Observable<SearchRequestResult<Anime>> {
    return this.cache.get<SearchRequestResult<Anime>>(this.keyAnime, name);
  }

  getGenres(): Observable<Genre[]> {
    return this.cache.get<Genre[]>(this.keyGenres);
  }

  getById(id: number): Observable<Anime> {
    return fileCabApi.getAnimeById(id);
  }
}
