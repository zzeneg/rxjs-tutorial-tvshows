import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PosterService } from 'src/app/services/poster.service';
import { Subscription } from 'rxjs';
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
  selector: 'app-shows',
  templateUrl: './shows.component.html',
  styleUrls: ['./shows.component.scss']
})
export class ShowsComponent implements OnInit, OnDestroy {
  networks: string[] = ['Netflix', 'HBO', 'Amazon', 'CBS', 'AMC', 'BBC One'];
  headers: string[] = ['title', 'year', 'network', 'status', 'rating'];

  shows: Show[];
  selectedShow: Show;
  selectedNetwork: string;
  sortingProperty: string;
  sortingDesc: boolean;

  private subscription = new Subscription();
  private networkParam = 'network';
  private sortPropertyParam = 'sort';
  private sortDescParam = 'desc';
  private showParam = 'show';

  constructor(private httpClient: HttpClient, private posterService: PosterService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.subscription.add(this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0 !== window.location.href.includes('?')) {
        return;
      }
      const selectedNetwork = params[this.networkParam] as string;
      if (!this.selectedNetwork || selectedNetwork !== this.selectedNetwork) {
        this.selectedNetwork = selectedNetwork;
        const url = this.getPopularShowsUrl(this.selectedNetwork);
        this.subscription.add(this.httpClient.get<unknown[]>(url).subscribe(data => {
          console.log('load');
          this.shows = this.convertShows(data);
          this.sortShows(this.shows, params[this.sortPropertyParam], params[this.sortDescParam]);
          this.selectedShow = this.shows.find(x => x.title === params[this.showParam]);
        }));
      } else {
        this.sortShows(this.shows, params[this.sortPropertyParam], params[this.sortDescParam]);
        this.selectedShow = this.shows.find(x => x.title === params[this.showParam]);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
    this.sortingProperty = property || 'title';
    this.sortingDesc = desc === 'true';
    shows.sort((a, b) => (a[this.sortingProperty] > b[this.sortingProperty] ? 1 : -1) * (this.sortingDesc ? -1 : 1));
  }

}
