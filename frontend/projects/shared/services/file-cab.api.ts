import { environment } from '../../../environments/environment';
import { Anime, Film, Genre, SearchRequestResult } from '../../../../server/src/api';
import { Observable, timer } from 'rxjs';
import { delayWhen, map, retryWhen, tap } from 'rxjs/operators';

const apiUrl = environment.apiUrl;

class FileCabApi {
  searchAnime(name: string): Observable<SearchRequestResult<Anime>> {
    return this.fetchObservable<SearchRequestResult<Anime>>('anime/search?name=' + name);
  }

  getAnimeById(id: number): Observable<Anime> {
    return this.fetchObservable<Anime>('anime/' + id);
  }

  loadAnimeGenres(): Observable<Genre[]> {
    return this.fetchObservable<Genre[]>(`anime/genres`).pipe(
      map(list => list.sort((a, b) => a.name.localeCompare(b.name))),
    );
  }

  searchFilm(name: string): Observable<SearchRequestResult<Film>> {
    return this.fetchObservable<SearchRequestResult<Film>>('films/movie?name=' + name);
  }

  searchTv(name: string): Observable<SearchRequestResult<Film>> {
    return this.fetchObservable<SearchRequestResult<Film>>('films/tv?name=' + name);
  }

  loadFilmGenres(): Observable<Genre[]> {
    return this.fetchObservable<Genre[]>(`films/genres`).pipe(
      map(list => list.sort((a, b) => a.name.localeCompare(b.name))),
    );
  }

  private fetchObservable<T>(path: string): Observable<T> {
    return new Observable<T>((observer) => {
      const controller = new AbortController();

      fetch(new URL(apiUrl + path).href, {
        signal: controller.signal,
      })
        .then(res => res.json())
        .then(res => {
          observer.next(res);
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
        });

      return () => {
        controller.abort();
        observer.complete();
      };
    }).pipe(
      retryWhen(errors => errors.pipe(
        tap(val => console.log('xxx err', val)),
        delayWhen(() => timer(3000)),
      )),
    );
  }
}

export const fileCabApi = new FileCabApi();
