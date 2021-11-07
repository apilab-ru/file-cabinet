import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { Anime, Genre, SearchRequestResult } from '@server/api/index';
import { Observable } from 'rxjs';
import { fileCabApi } from '@shared/services/file-cab.api';
import { FileCab } from '@shared/services/file-cab';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  genres$ = this.fileCab.animeGenres$;

  private readonly keyGenres = 'cache_genres-anime';
  private readonly keyAnime = 'cache_anime';

  constructor(
    private cache: CacheService,
    private fileCab: FileCab,
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

  getById(id: number): Observable<Anime> {
    return fileCabApi.getAnimeById(id);
  }
}
