import { Injectable, NgZone } from '@angular/core';
import { CacheService } from './cache.service';
import { MediaItem, SearchRequestResult } from '@server/models/index';
import { Observable } from 'rxjs';
import { fileCabApi } from '@shared/services/file-cab.api';
import { FileCabService } from '@shared/services/file-cab.service';
import { runInZone } from '@shared/utils/run-in-zone';


@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  private readonly keyAnime = 'cache_anime';

  constructor(
    private cache: CacheService,
    private fileCabService: FileCabService,
    private ngZone: NgZone,
  ) {
    this.cache.register<MediaItem[]>(
      this.keyAnime,
      fileCabApi.searchAnime.bind(fileCabApi),
    );
  }

  findAnime(name: string): Observable<SearchRequestResult<MediaItem>> {
    return this.cache.get<SearchRequestResult<MediaItem>>(this.keyAnime, name).pipe(
      runInZone(this.ngZone),
    );
  }

  getById(id: number): Observable<MediaItem> {
    return fileCabApi.getAnimeById(id).pipe(
      runInZone(this.ngZone),
    );
  }
}
