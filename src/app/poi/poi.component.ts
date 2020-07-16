import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api/api.service';
import { Router } from "@angular/router";
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-poi",
  templateUrl: "./poi.component.html",
  styleUrls: ["./poi.component.scss"],
})
export class PoiComponent implements OnInit {
  public id: string;

  public poi: {
    id: string;
    alias: string;
    address: string;
    last_updated: number;
    has_more_resources: boolean;
    location: {
      latitude: number;
      longitude: number;
    };
    resource_ratings: {};
    resource_score: number;
    score: number;
  };

  public resources: {
    name: string;
    score: number;
    ratings: number;
  }[] = [];

  public isRated: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    public router: Router
  ) {
    this.activatedRoute.params.subscribe((params) => {
      if (params.id) {
        this.id = params.id;
      }
      this.getPOIProfile();
      this.checkRated();
    });
  }

  ngOnInit() {}

  private getPOIProfile(): void {
    this.apiService
      .request('get', `${environment.autonomy_api_url}api/points-of-interest/${this.id}`, null, null, ApiService.DSTarget.CDS)
      .subscribe(
        (data: any) => {
          this.poi = data;
          for (let key in this.poi.resource_ratings) {
            this.resources.push({
              name: key.replace(/_/g, " "),
              score: this.poi.resource_ratings[key].score,
              ratings: this.poi.resource_ratings[key].counts,
            });
          }
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  private checkRated(): void {
    this.apiService
      .request("get", `${environment.autonomy_api_url}api/points-of-interest/${this.id}/ratings`, null, null, ApiService.DSTarget.PDS)
      .subscribe(
        (data: { ratings: any }) => {
          for (let key in data.ratings) {
            if(data.ratings[key] > 0) {
              this.isRated = true;
              break;
            }
          }
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }
}
