import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { NavigationItem } from '../../api';
import { MENU_ITEMS } from '../menu-items';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private items$ = new ReplaySubject<NavigationItem[]>(1);
  private structItems = [
    {
      name: 'Аниме',
      path: 'anime'
    },
    {
      name: 'Фильмы',
      path: 'films'
    },
    {
      name: 'Сериалы',
      path: 'tv'
    },
    {
      name: 'Статьи',
      path: 'articles'
    }
  ];

  constructor() {
    this.items$.next(MENU_ITEMS);
  }

  getItems(): Observable<NavigationItem[]> {
    return this.items$.asObservable();
  }

  getStruct(): Observable<NavigationItem[]> {
    return of(this.structItems);
  }
}
