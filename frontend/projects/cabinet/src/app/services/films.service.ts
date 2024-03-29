import { Injectable, NgZone } from '@angular/core';
import { CacheService } from './cache.service';
import { MediaItem, SearchRequest, SearchRequestResult } from '../../models';
import { Observable } from 'rxjs';
import { fileCabApi } from '@shared/services/file-cab.api';
import { FileCabService } from '@shared/services/file-cab.service';
import { runInZone } from '@shared/utils/run-in-zone';


@Injectable({
  providedIn: 'root',
})
export class FilmsService {
  private readonly keyMovie = 'cache_movie';
  private readonly keyTv = 'cache_tv';

  constructor(
    private cache: CacheService,
    private fileCabService: FileCabService,
    private ngZone: NgZone,
  ) {
    this.cache.register<SearchRequestResult<MediaItem>>(
      this.keyMovie,
      fileCabApi.searchFilm.bind(this),
    );

    this.cache.register<SearchRequestResult<MediaItem>>(
      this.keyTv,
      fileCabApi.searchTv.bind(this),
    );
  }

  findMovie(param: SearchRequest): Observable<SearchRequestResult<MediaItem>> {
    return this.cache.get<SearchRequestResult<MediaItem>>(this.keyMovie, param).pipe(
      runInZone(this.ngZone),
    );
  }

  findTv(param: SearchRequest): Observable<SearchRequestResult<MediaItem>> {
    return this.cache.get<SearchRequestResult<MediaItem>>(this.keyTv, param).pipe(
      runInZone(this.ngZone),
    );
  }
}
