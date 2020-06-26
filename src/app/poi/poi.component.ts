import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api/api.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-poi',
  templateUrl: './poi.component.html',
  styleUrls: ['./poi.component.scss']
})
export class PoiComponent implements OnInit {
  public id: string;
  public lat: number;
  public long: number;

  public poi: {
    id: string,
    alias: string,
    address: string,
    owned: boolean,
    rating: boolean,
    has_more_resources: boolean,
    neighbor: {
      confirm: number,
      confirm_delta: number,
      symptom: number,
      symptom_delta: number,
      behavior: number,
      behavior_delta: number,
      score: number,
      score_delta: number
    },
    resources: {
      resource: {
        id: string,
        name: string
      },
      score: number,
      ratings: number
    }[],
    autonomy_score: number,
    autonomy_score_delta: number
  };

  public resources: {
    resource: {
      id: string,
      name: string
    },
    score: number,
    ratings: number
  }[];

  constructor(private activatedRoute: ActivatedRoute, private apiService: ApiService, private router: Router) {
    this.activatedRoute.params.subscribe((params) => {
      if (params.id) {
        this.id = params.id;
      } else if (params.lat) {
        this.lat = params.lat;
        this.long = params.long;
      }
      this.getPOIProfile();
    });
  }

  ngOnInit() {}

  private getPOIProfile(): void {
    let url: string;
    if (this.id) {
      url = `api/autonomy_profile?poi_id=${this.id}&all_resources=true`;
    } else {
      url = `api/autonomy_profile?lat=${this.lat}&lng=${this.long}&all_resources=true`;
    }

    this.apiService
      .request('get', url)
      .subscribe(
        (data: any) => {
          this.poi = data;
          this.resources = this.poi.resources.slice(0, 10);
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      )
  }

  public monitor() {
    this.apiService
      .request('post', 'api/accounts/me/pois', {poi_id: this.poi.id})
      .subscribe(
        (data) => {
          this.poi.owned = true;
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  public showMore() {
    this.resources = this.poi.resources;
  }
}
