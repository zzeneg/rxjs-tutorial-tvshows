import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PosterService {

  constructor() { }

  getPosterSrc(id: string): string {
    return `http://img.omdbapi.com/?apikey=${environment.omdbApiKey}&i=${id}`;
  }
}
