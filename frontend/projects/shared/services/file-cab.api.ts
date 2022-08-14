import { MediaItem, SearchRequest, SearchRequestResult } from '@server/models/index';
import { Observable } from 'rxjs';
import { fetchObservable } from '@shared/utils/fetch-observable';
import { Genre } from '@server/models/genre';

class FileCabApi {
  searchAnime(param: SearchRequest): Observable<SearchRequestResult<MediaItem>> {
    const queryParam = this.prepareParams(param);
    return fetchObservable<SearchRequestResult<MediaItem>>('anime/v2/search?' + queryParam.toString());
  }

  getAnimeById(id: number): Observable<MediaItem> {
    return fetchObservable<MediaItem>('anime/v2/' + id);
  }

  searchFilm(param: SearchRequest): Observable<SearchRequestResult<MediaItem>> {
    const queryParam = this.prepareParams(param);
    return fetchObservable<SearchRequestResult<MediaItem>>('films/v2/movie?name=' + queryParam.toString());
  }

  searchTv(param: SearchRequest): Observable<SearchRequestResult<MediaItem>> {
    const queryParam = this.prepareParams(param);
    return fetchObservable<SearchRequestResult<MediaItem>>('films/v2/tv?name=' + queryParam.toString());
  }

  loadGenres(): Observable<Genre[]> {
    return fetchObservable<Genre[]>(`genres/list`);
  }

  private prepareParams<T>(params: T): URLSearchParams {
    const clearedParams = Object.entries(params)
      .filter(([key, value]) => !!value)
      .reduce((prev, [key, value]) => ({ ...prev, [key]: value }), {});

    return new URLSearchParams(
      clearedParams,
    );
  }
}

export const fileCabApi = new FileCabApi();
