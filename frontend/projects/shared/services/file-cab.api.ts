import { environment } from '../../../environments/environment';
import { Anime, Film, Genre, SearchRequestResult } from '../../../../server/src/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
const apiUrl = environment.apiUrl;

function fetchObservable<T>(path: string): Observable<T> {
  return new Observable<T>((observer) => {
    const controller = new AbortController();

    fetch(new URL(apiUrl + path).href, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(res => {
        observer.next(res);
        observer.complete();
      })
      .catch(err => {
        observer.error(err);
      })

    return () => {
      controller.abort();
      observer.complete();
    }
  })
}

class FileCabApi {
  searchAnime(name: string): Observable<SearchRequestResult<Anime>> {
    return fetchObservable<SearchRequestResult<Anime>>('anime/search?name=' + name);
  }

  getAnimeById(id: number): Observable<Anime> {
    return fetchObservable<Anime>('anime/' + id);
  }

  loadAnimeGenres(): Observable<Genre[]> {
    return fetchObservable<Genre[]>(`anime/genres`).pipe(
      map(list => list.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }

  searchFilm(name: string): Observable<SearchRequestResult<Film>> {
    return fetchObservable<SearchRequestResult<Film>>('films/movie?name=' + name);
  }

  searchTv(name: string): Observable<SearchRequestResult<Film>> {
    return fetchObservable<SearchRequestResult<Film>>('films/tv?name=' + name);
  }

  loadFilmGenres(): Observable<Genre[]> {
    return fetchObservable<Genre[]>(`films/genres`).pipe(
      map(list => list.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }
}

export const fileCabApi = new FileCabApi();
