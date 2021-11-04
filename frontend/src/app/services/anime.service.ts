import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import { Anime, SearchRequestResult, Genre} from '@cab/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {

  private readonly keyGenres = 'cache_genres-anime';
  private readonly keyAnime = 'cache_anime';

  constructor(
    private api: ApiService,
    private cache: CacheService,
  ) {
    this.cache.register<Genre[]>(
      this.keyGenres,
      this.loadGenres.bind(this)
    );

    this.cache.register<Anime[]>(
      this.keyAnime,
      this.loadFindAnime.bind(this)
    );
  }

  findAnime(name: string): Observable<SearchRequestResult<Anime>> {
    return this.cache.get<SearchRequestResult<Anime>>(this.keyAnime, name);
  }

  getGenres(): Observable<Genre[]> {
    return this.cache.get<Genre[]>(this.keyGenres);
  }

  getById(id: number): Observable<Anime> {
    return this.api.get<Anime>(`anime/${id}`);
  }

  private loadGenres(): Observable<Genre[]> {
    return this.api.get<Genre[]>(`anime/genres`)
      .pipe(map(list => list.sort((a, b) => a.name.localeCompare(b.name))));
  }

  private loadFindAnime(name: string): Observable<SearchRequestResult<Anime>> {
    return this.api.get<SearchRequestResult<Anime>>(`anime/search`, {name});
  }
}
