import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, switchAll, switchMapTo } from 'rxjs/operators';
import { FilmsService } from './services/films.service';
import { AnimeService } from './services/anime.service';
import { NavigationService } from './services/navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {

  readonly navLinks$ = this.navigationService.getItems();

  inputControl: FormControl = new FormControl;

  @HostBinding('class.app') isMainClass = true;

  private readonly inputDebounce = 300;

  constructor(
    private filmsService: FilmsService,
    private animeService: AnimeService,
    private navigationService: NavigationService,
  ) {
    window['test'] = () => {name: '123'};
  }

  ngOnInit(): void {
    this.inputControl
      .valueChanges
      .pipe(
        debounceTime(this.inputDebounce),
      )
      .subscribe(value => {
        console.log('value', value);
        /*this.filmsService
          .findMovie(value)
          .subscribe(list => console.log('list', list));*/

        this.animeService
          .findAnime(value)
          .subscribe(list => console.log('list', list));
      });
  }
}
