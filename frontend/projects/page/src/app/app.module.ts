import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { MainComponent } from './components/main/main.component';

@NgModule({
  declarations: [
    MainComponent,
  ],
  exports: [
    MainComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  entryComponents: [
    MainComponent,
  ],
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {
  }

  ngDoBootstrap(): void {
    const el = createCustomElement(MainComponent, {
      injector: this.injector,
    });
    customElements.define('file-cabinet-page', el);
  }
}
