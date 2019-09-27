import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { StarsComponent } from './stars/stars.component';
import { createCustomElement } from '@angular/elements';
import { StarsModule } from './stars/stars.module';

@NgModule({
  imports: [
    BrowserModule,
    StarsModule,
  ]
})
export class AppModule {

  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    // using createCustomElement from angular package it will convert angular component to stander web component
    const el = createCustomElement(StarsComponent, {
      injector: this.injector
    });
    // using built in the browser to create your own custome element name
    customElements.define('app-stars', el);
  }
}
