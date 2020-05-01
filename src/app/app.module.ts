import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShowsComponent } from './components/shows/shows.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShowsRxjsComponent } from './components/shows-rxjs/shows-rxjs.component';

@NgModule({
  declarations: [
    AppComponent,
    ShowsComponent,
    ShowsRxjsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
