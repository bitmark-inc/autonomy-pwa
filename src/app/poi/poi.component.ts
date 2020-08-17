import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api/api.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Util } from '../services/util/util.service';
import * as moment from "moment";
import { NoInternetErrors } from '../errors';

@Component({
  selector: "app-poi",
  templateUrl: "./poi.component.html",
  styleUrls: ["./poi.component.scss"],
})
export class PoiComponent implements OnInit, OnDestroy {
  public id: string;

  public poi: {
    id: string;
    alias: string;
    address: string;
    info_last_updated: number;
    rating_last_updated: number;
    has_more_resources: boolean;
    location: {
      latitude: number;
      longitude: number;
    };
    resource_ratings: {};
    resource_rating_count: number;
    resource_score: number;
    score: number;
    opening_hours: any;
    service_options: any;
  };

  public resources: {
    name: string;
    score: number;
    ratings: number;
    color: string;
  }[] = [];

  public isRated: boolean = false;
  public poiBackground: string = '';
  public todayOpenHour: string = '';
  public openHours: {
    openHour: string;
    dates: string;
  }[] = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    public router: Router,
    private elementRef: ElementRef
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

  ngOnDestroy() {
    this.elementRef.nativeElement.ownerDocument.body.style.background = 'initial';
  }

  private getPOIProfile(): void {
    this.apiService
      .request('get', `${environment.autonomy_api_url}api/points-of-interest/${this.id}`, null, null, ApiService.DSTarget.CDS)
      .subscribe(
        (data: any) => {
          this.poi = data;
          this.formatPOI();
        },
        (err: any) => {
          if (err instanceof NoInternetErrors) {
            window.alert(err.message);
          } else {
            console.log(err);
          }
        }
      );
  }

  private formatPOI() {
    this.poiBackground = Util.scoreToColor(this.poi.resource_score, false);
    this.elementRef.nativeElement.ownerDocument.body.style.background = this.poiBackground;
    for (let key in this.poi.resource_ratings) {
      this.resources.push({
        name: key.replace(/_/g, " "),
        score: this.poi.resource_ratings[key].score,
        ratings: this.poi.resource_ratings[key].counts,
        color: Util.scoreToColor(this.poi.resource_ratings[key].score, false),
      });
    }
    if (this.poi.opening_hours && Object.keys(this.poi.opening_hours).length != 0) {
      this.openHours = Util.openHoursFormat(this.poi.opening_hours);
      this.todayOpenHour = Util.openHoursFormat(this.poi.opening_hours, true);
    }
    if (this.poi.service_options && Object.keys(this.poi.service_options).length != 0) {
      let tmp = [];
      let services = Object.keys(this.poi.service_options);
      for (let i = 0; i < services.length; i++) {
        tmp.push({
          name: services[i],
          active: Object.values(this.poi.service_options)[i]
        })
      }
      this.poi.service_options = tmp;
    }
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
          if (err instanceof NoInternetErrors) {
            window.alert(err.message);
          } else {
            console.log(err);
          }
          // TODO: do something
        }
      );
  }
}
