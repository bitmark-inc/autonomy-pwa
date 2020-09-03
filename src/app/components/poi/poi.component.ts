declare var window: any;

import { Location } from '@angular/common';
import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Util } from '../../services/util/util.service';
import { AppSettings } from '../../app-settings';
import { EventEmitterService } from '../../services/event-emitter.service';

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
    opening_hours: {};
    service_options: any;
  };

  public resources: {
    name: string;
    score: number;
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
    private userService: UserService,
    public router: Router,
    private elementRef: ElementRef,
    private location: Location
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
      .subscribe((data) => {
          this.poi = data;
          this.formatPOI();
        },
        (err) => {
          window.alert(err.message);
        }
      );
  }

  private formatPOI() {
    this.poiBackground = Util.scoreToColor(this.poi.resource_score, false);
    this.elementRef.nativeElement.ownerDocument.body.style.background = this.poiBackground;
    AppSettings.RESOURCE_RATINGS.forEach((key) => {
      this.resources.push({
        name: key.replace(/_/g, ' '),
        score: this.poi.resource_ratings[key] ? this.poi.resource_ratings[key].score : 0,
        color: Util.scoreToColor((this.poi.resource_ratings[key] ? this.poi.resource_ratings[key].score : 0), false),
      });
    })
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
      .request('get', `${environment.autonomy_api_url}api/points-of-interest/${this.id}/ratings`, null, null, ApiService.DSTarget.PDS)
      .subscribe(
        (data: { ratings: {} }) => {
          for (let i = 0; i < AppSettings.RESOURCE_RATINGS.length; i++) {
            if(data.ratings[AppSettings.RESOURCE_RATINGS[i]] > 0) {
              this.isRated = true;
              break;
            }
          }
        },
        (err) => {
          window.alert(err.message);
          // TODO: do something
        }
      );
  }

  public openIntercom(): void {
    let hash = window.sha3_256(this.userService.getAccountNumber());
    let icUserID = `Autonomy_pwa_${hash}`;
    window.Intercom('boot', {
      app_id: window.intercomSettings.app_id,
      user_id: icUserID,
      hide_default_launcher: true
    });
    window.Intercom('show');
  }

  public openFeedback() {
    EventEmitterService.getEventEmitter(EventEmitterService.Events.FeedbackDialogShown).emit({ fromQ1: true })
  }

  public back(): void {
    this.location.getState();
    this.location.back();
  }
}
