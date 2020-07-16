import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api/api.service';
import { Router } from "@angular/router";
import { environment } from 'src/environments/environment';

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

  public poiScore: number = 0;

  constructor(private activatedRoute: ActivatedRoute, private apiService: ApiService, public router: Router) {
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
      url = `${environment.autonomy_api_url}api/autonomy_profile?poi_id=${this.id}&all_resources=true`;
    } else {
      url = `${environment.autonomy_api_url}api/autonomy_profile?lat=${this.lat}&lng=${this.long}&all_resources=true`;
    }

    this.apiService
      .request('get', `${environment.autonomy_api_url}api/points-of-interest/${this.id}`, null, null, ApiService.DSTarget.CDS)
      .subscribe(
        (data: any) => {
          this.poi = data;
          this.resources = this.poi.resources;
          this.getPoiScore();
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      )
  }

  private getPoiScore() {
    if (this.resources.length) {
      let scoresTotal = 0;
      let ratingsTotal = 1;
      for (let i = 0; i < this.resources.length; i++) {
        scoresTotal += (this.resources[i].score * this.resources[i].ratings);
        ratingsTotal += this.resources[i].ratings;
      }
      this.poiScore = scoresTotal / ratingsTotal;
    }
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

  public forgetPOI() {
    this.apiService
      .request("delete", `api/accounts/me/pois/${this.poi.id}`)
      .subscribe(
        (data) => {
          this.poi.owned = false;
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
