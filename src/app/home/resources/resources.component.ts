declare var window: any;

import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ApiService } from './../../services/api/api.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from "@angular/core";
import { HomepageState as ParentContainerState } from '../homepage.state';
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
import { Observable, fromEvent, Subscriber } from "rxjs";
import { Util } from '../../services/util/util.service';
import { AppSettings } from '../../app-settings';
import * as moment from 'moment';
import { GoogleMap } from '@angular/google-maps';

let FakePOIS = [
  {
    "id": "5e992e1b0c30685ba05cc4b5",
    "alias": "Raohe Night Market",
    "address": "Raohe Night Market, Raohe Street, Songshan District, Taipei City, Taiwan",
    "score": 0,
    "location": {
      "latitude": 37.871580,
      "longitude": -122.263214
    },
    "resource_score": 2,
    "resource_ratings": null,
    "last_updated": 0,
    "focused": false,
    "color": ''
  },
  {
    "id": "5f110ca368bf494d8a61b282",
    "alias": "蜥蜴咖哩",
    "address": "號, No. 3南港路一段136巷6弄南港區台北市台灣 115",
    "score": 0,
    "location": {
      "latitude": 37.871427,
      "longitude": -122.255264
    },
    "resource_score": 5,
    "resource_ratings": null,
    "last_updated": 1594969910069,
    "focused": false,
    "color": ''
  },
  {
    "id": "5f15483068bf494d8a61b283",
    "alias": "Caffè Strada",
    "address": "2300 College Ave, Berkeley, CA 94704美國",
    "score": 0,
    "location": {
      "latitude": 37.869146,
      "longitude": -122.254859
    },
    "resource_score": 0,
    "resource_ratings": null,
    "last_updated": 0,
    "focused": false,
    "color": ''
  }
];

interface POI {
  id: string,
  alias: string,
  address: string,
  location: {
    latitude: number,
    longitude: number
  },
  rating_last_updated: number,
  opening_hours: any,
  place_types: [],
  service_options: any,
  resource_score: number,
  focused: boolean,
  place_type: string,
  todayOpenHour: string,
  services_active: string,
  color: string
}

@Component({
  selector: "app-resources",
  templateUrl: "./resources.component.html",
  styleUrls: ["./resources.component.scss"],
})
export class ResourcesComponent implements OnInit, OnDestroy {
  @ViewChild("poiSearchInput", { static: true }) poiSearchInput: ElementRef;
  @ViewChild(GoogleMap) mapRef: GoogleMap;

  // Searching settings
  public keyword: string = "";

  public poiType: string;
  public poiTypes: string[];

  public focusedPOI: POI;

  public isSearching: boolean = false;
  public focusState: boolean = false;
  public isViewListShow: boolean = false;
  public pois: POI[];

  // Map settings
  private UCBekerleyLatlng: google.maps.LatLngLiteral = {
    lat: 37.871971,
    lng: -122.258529
  }
  public mapCenter: google.maps.LatLngLiteral;
  public mapIconSVGPath: string = 'M0.5 10.8975C0.5 5.09246 5.195 0.397461 11 0.397461C16.805 0.397461 21.5 5.09246 21.5 10.8975C21.5 17.1525 14.87 25.7775 12.155 29.0625C11.555 29.7825 10.46 29.7825 9.86 29.0625C7.13 25.7775 0.5 17.1525 0.5 10.8975ZM7.25 10.8975C7.25 12.9675 8.93 14.6475 11 14.6475C13.07 14.6475 14.75 12.9675 14.75 10.8975C14.75 8.82746 13.07 7.14746 11 7.14746C8.93 7.14746 7.25 8.82746 7.25 10.8975Z';
  public mapHeight: string;
  public mapWidth: string;
  public mapZoomLevel: number = 18;
  public mapOptions: google.maps.MapOptions = {
    zoom: this.mapZoomLevel,
    maxZoom: 25,
    minZoom: 17,
    disableDefaultUI: true,
    styles: [{featureType: 'poi', stylers: [{visibility: 'off'}]}]
  };

  public labelPosition = new google.maps.Point(0,37);
  public labelShown: boolean = true;

  constructor(private apiService: ApiService, public router: Router, private ngZone: NgZone) {
    this.mapCenter = this.UCBekerleyLatlng;
    this.mapHeight = `${window.innerHeight - 56 -60}px`;
    this.mapWidth = `${window.innerWidth > 768 ? 768 : window.innerWidth}px`;
    this.getResourcesForSearching();
    this.search();
  }

  ngOnInit() {
    fromEvent(this.poiSearchInput.nativeElement, "keyup")
      .pipe(
        map((event: any) => {
          return this.keyword;
        }),
        // filter((res) => res.length > 0),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.searchByKeyword();
      });
  }

  ngOnDestroy() {
    ParentContainerState.fullscreen.next(false);
  }

  private getResourcesForSearching() {
    this.poiTypes = ['restaurants', 'coffee', 'groceries', 'pharmacies', 'laundromats'];
  }

  private formatPOI() {
    this.pois.forEach(poi => {
      poi.place_type = poi.place_types.join(', ');
      if (poi.opening_hours && Object.keys(poi.opening_hours).length != 0) {
        let time = Util.openHoursFormat(poi.opening_hours, true);
        poi.todayOpenHour = time === 'Closed' ? 'Closed today' : `Open ${time} today`;
      } else {
        poi.todayOpenHour = '';
      }
      if (poi.service_options && Object.keys(poi.service_options).length != 0) {
        poi.services_active = Object.keys(poi.service_options).map(e => poi.service_options[e] ? e : '').filter(s => s != '').join(', ');
      } else {
        poi.services_active = '';
      }
    })
  }

  private fakeResourceScore() {
    this.pois.forEach(poi => {
      poi.resource_score = Math.floor(Math.random() * 5.0);
      poi.rating_last_updated = 1595402179094;
    })
  }

  public zoomHandle() {
    if (this.mapRef) {
      this.mapZoomLevel = this.mapRef.getZoom();
      this.labelShown = this.mapZoomLevel >= 18;
    }
  }

  public onInputFocus() {
    ParentContainerState.fullscreen.next(true);
    this.isViewListShow = true;
    this.focusState = false;
  }

  public onInputFocusOut() {
    if (!(this.keyword || this.poiType)) {
      ParentContainerState.fullscreen.next(false);
    }
  }

  private searchByKeyword() {
    this.search();
  }

  public searchByPlaceType(type: string) {
    ParentContainerState.fullscreen.next(true);
    this.isViewListShow = true;
    this.focusState = false;
    this.poiType = type;
    this.search();
  }

  public search() {
    this.isSearching = true;
    let url = `${environment.autonomy_api_url}api/points-of-interest`;
    let params: string[] = [];

    // get all at first from ucberkeley is center of map
    if (!this.keyword && !this.poiType) {
      params.push(`lat=${this.mapCenter.lat}&lng=${this.mapCenter.lng}&radius=1000`);
    }

    if (this.keyword) {
      params.push(`lat=${this.mapCenter.lat}&lng=${this.mapCenter.lng}&radius=3000&text=${this.keyword}`);
    }
    if (this.poiType) {
      params.push(`lat=${this.mapCenter.lat}&lng=${this.mapCenter.lng}&radius=3000&place_type=${this.poiType}`);
    }
    if (params.length) {
      url += `?profile=berkeley&${params.join("&")}`;
    }

    this.apiService
    .request('get', url, null, null, ApiService.DSTarget.CDS)
    .subscribe(
      (data) => {
        this.isSearching = false;
        this.mapZoomLevel = 19;
        this.labelShown = true;
        this.pois = data;
        this.fakeResourceScore();
        this.formatPOI();
        this.updatePlaceColors();
      },
      (err) => {
        this.isSearching = false;
      }
    );
  }

  public updatePlaceColors() {
    this.pois.forEach((poi) => {
      if (poi.todayOpenHour && poi.todayOpenHour != 'Closed today') {
        poi.color = Util.scoreToColor(poi.resource_score, false);
      } else {
        poi.color = Util.scoreToColor(poi.resource_score, true);
      }
    });
  }

  public focusToPlace(poi: POI) {
    this.focusState = true;
    this.focusedPOI = poi;
    this.focusedPOI.focused = true;
    this.mapZoomLevel = 19;
    this.labelShown = true;
    this.mapCenter = {
      lat: this.focusedPOI.location.latitude,
      lng: this.focusedPOI.location.longitude,
    };
    this.updatePlaceColors();
  }

  public unfocusPlace(poi: POI) {
    this.focusState = false;
    this.focusedPOI.focused = false;
    this.focusedPOI = null;
    this.updatePlaceColors();
  }

  public clearAll() {
    if (this.keyword || this.poiType) {
      this.keyword = "";
      this.poiType = "";
      this.isViewListShow = false;
      this.isSearching = false;
      this.search();
      ParentContainerState.fullscreen.next(false);
    }
  }

  // public navigateToPlace(place: any) {
  //   this.apiService
  //     .request("post", "api/points-of-interest", {
  //       alias: place.name,
  //       address: place.formatted_address,
  //       location: {
  //         latitude: place.geometry.location.lat(),
  //         longitude: place.geometry.location.lng(),
  //       },
  //     })
  //     .subscribe(
  //       (data: { id: string }) => {
  //         this.ngZone.run(() => {
  //           this.navigateToPOI(data.id);
  //         });
  //       },
  //       (err) => {
  //         console.log(err);
  //         // TODO: do something
  //       }
  //     );
  // }

  public navigateToPOI(id: string) {
    this.router.navigate(["/pois", id]);
  }

  public isStandalone(): boolean {
    return (window.matchMedia('(display-mode: standalone)').matches);
  }
}
