import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PosterService } from 'src/app/services/poster.service';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap, tap, filter, distinctUntilChanged, share } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

interface Show {
  title: string;
  year: number;
  network: string;
  overview: string;
  genres: string[];
  status: string;
  rating: number;
  posterSrc: string;
}

@Component({
  selector: 'app-shows-rxjs',
  templateUrl: './shows-rxjs.component.html',
  styleUrls: ['./shows-rxjs.component.scss']
})
export class ShowsRxjsComponent implements OnInit {
  networks: string[] = ['Netflix', 'HBO', 'Amazon', 'CBS', 'AMC', 'BBC One'];
  headers: string[] = ['title', 'year', 'network', 'status', 'rating'];

  shows$: Observable<Show[]>;
  selectedShow$: Observable<Show>;
  selectedNetwork: string;
  sortingProperty: string;
  sortingDesc: boolean;

  private networkParam = 'network';
  private sortPropertyParam = 'sort';
  private sortDescParam = 'desc';
  private showParam = 'show';

  constructor(private httpClient: HttpClient, private posterService: PosterService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const params$ = this.route.queryParams.pipe(filter(params => Object.keys(params).length > 0 === window.location.href.includes('?')));
    const selectedNetwork$ = params$.pipe(
      map(params => params[this.networkParam] as string),
      distinctUntilChanged(),
      tap(network => this.selectedNetwork = network),
    );
    const url$ = selectedNetwork$.pipe(map(network => this.getPopularShowsUrl(network)));
    const data$ = url$.pipe(switchMap(url => this.httpClient.get<unknown[]>(url).pipe(tap(() => console.log('load')))));
    const unsortedShows$ = data$.pipe(map(data => this.convertShows(data)), share());
    // or the same but with combined pipes
    // const unsortedShows$ = params$.pipe(
    //   map(params => params[this.networkParam] as string),
    //   distinctUntilChanged(),
    //   tap(network => this.selectedNetwork = network),
    //   map(network => this.getPopularShowsUrl(network)),
    //   switchMap(url => this.httpClient.get<unknown[]>(url)),
    //   tap(() => console.log('load')),
    //   map(data => this.convertShows(data)),
    //   share(),
    // );
    const sortProperty$ = params$.pipe(map(params => params[this.sortPropertyParam] as string), distinctUntilChanged());
    const sortDesc$ = params$.pipe(map(params => params[this.sortDescParam] as string), distinctUntilChanged());
    this.shows$ = combineLatest([unsortedShows$, sortProperty$, sortDesc$]).pipe(
      map(([shows, sortProperty, sortDesc]) => { this.sortShows(shows, sortProperty, sortDesc); return shows; }));
    const selectedShowTitle$ = params$.pipe(map(params => params[this.showParam] as string));
    this.selectedShow$ = combineLatest([unsortedShows$, selectedShowTitle$]).pipe(map(([shows, title]) => shows.find(x => x.title === title)));
  }

  onNetworkSelect(network: string) {
    const queryParams = { [this.networkParam]: this.selectedNetwork !== network ? network : null, [this.showParam]: null };
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  onShowSelect(show: Show) {
    const queryParams = { [this.showParam]: show ? show.title : null };
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  onSort(property: string) {
    const sortingDesc = this.sortingProperty === property && !this.sortingDesc;
    const queryParams = { [this.sortPropertyParam]: property, [this.sortDescParam]: sortingDesc };
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  private getPopularShowsUrl(network?: string): string {
    let url = environment.traktApiUrl + '/shows/popular?extended=full';
    if (network) {
      url += '&networks=' + network;
    }
    return url;
  }

  private convertShows(data: any[]): Show[] {
    return data.map(x => Object.assign(x, { posterSrc: this.posterService.getPosterSrc(x.ids.imdb) }));
  }

  private sortShows(shows: Show[], property?: string, desc?: string) {
    console.log('sortShows');
    console.log(property);
    console.log(desc);
    this.sortingProperty = property || 'title';
    this.sortingDesc = desc === 'true';
    shows.sort((a, b) => (a[this.sortingProperty] > b[this.sortingProperty] ? 1 : -1) * (this.sortingDesc ? -1 : 1));
  }
}
