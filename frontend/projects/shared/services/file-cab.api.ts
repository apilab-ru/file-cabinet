import { MediaItem, SearchRequestResult } from '@server/models/index';
import { Observable } from 'rxjs';
import { fetchObservable } from '@shared/utils/fetch-observable';
import { Genre } from '@server/models/genre';

class FileCabApi {
  searchAnime(name: string = ''): Observable<SearchRequestResult<MediaItem>> {
    return fetchObservable<SearchRequestResult<MediaItem>>('anime/v2/search?name=' + name);
  }

  getAnimeById(id: number): Observable<MediaItem> {
    return fetchObservable<MediaItem>('anime/v2/' + id);
  }

  searchFilm(name: string = ''): Observable<SearchRequestResult<MediaItem>> {
    return fetchObservable<SearchRequestResult<MediaItem>>('films/v2/movie?name=' + name);
  }

  searchTv(name: string = ''): Observable<SearchRequestResult<MediaItem>> {
    return fetchObservable<SearchRequestResult<MediaItem>>('films/v2/tv?name=' + name);
  }

  loadGenres(): Observable<Genre[]> {
    return fetchObservable<Genre[]>(`genres/list`);
  }
}

export const fileCabApi = new FileCabApi();
