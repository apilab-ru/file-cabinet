import { Anime, Film, GenreOld, MediaItem, SearchRequestResult } from '@server/models/index';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { fetchObservable } from '@shared/utils/fetch-observable';
import { Genre } from '@server/models/genre';

class FileCabApi {
  searchAnime(name: string = ''): Observable<SearchRequestResult<MediaItem>> {
    return fetchObservable<SearchRequestResult<MediaItem>>('anime/v2/search?name=' + name);
  }

  getAnimeById(id: number): Observable<MediaItem> {
    return fetchObservable<MediaItem>('anime/v2/' + id);
  }

  loadAnimeGenres(): Observable<GenreOld[]> {
    return fetchObservable<GenreOld[]>(`anime/genres`).pipe(
      map(list => list.sort((a, b) => a.name.localeCompare(b.name))),
    );
  }

  searchFilm(name: string = ''): Observable<SearchRequestResult<MediaItem>> {
    return fetchObservable<SearchRequestResult<MediaItem>>('films/v2/movie?name=' + name);
  }

  searchTv(name: string = ''): Observable<SearchRequestResult<MediaItem>> {
    return fetchObservable<SearchRequestResult<MediaItem>>('films/v2/tv?name=' + name);
  }

  loadFilmGenres(): Observable<GenreOld[]> {
    return fetchObservable<GenreOld[]>(`films/genres`).pipe(
      map(list => list.sort((a, b) => a.name.localeCompare(b.name))),
    );
  }

  loadGenres(): Observable<Genre[]> {
    return fetchObservable<Genre[]>(`genres/list`);
  }
}

export const fileCabApi = new FileCabApi();
