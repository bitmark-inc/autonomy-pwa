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

let FakeFilteredPOIS = [
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
    "filtered": false,
    "color": ''
  },
];

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
    "filtered": false,
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
    "filtered": false,
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
  resource_score: number,
  last_updated: number,
  filtered: boolean,
  focused: boolean,
  color: string
}

@Component({
  selector: "app-resources",
  templateUrl: "./resources.component.html",
  styleUrls: ["./resources.component.scss"],
})
export class ResourcesComponent implements OnInit, OnDestroy {
  @ViewChild("placeSearchInput", { static: true }) placeSearchInput: ElementRef;

  // Searching settings
  public keyword: string = "";

  public placeType: string;
  public placeTypes: string[];

  public focusedPlace: POI;

  public isSearching: boolean = false;
  public filteredPois: POI[];
  public allPois: POI[];

  // Map settings
  private UCBekerleyLatlng: google.maps.LatLngLiteral = {
    lat: 37.871971,
    lng: -122.258529
  }
  public mapCenter: google.maps.LatLngLiteral;
  public mapIconSVGPath: string = 'M0.5 10.8975C0.5 5.09246 5.195 0.397461 11 0.397461C16.805 0.397461 21.5 5.09246 21.5 10.8975C21.5 17.1525 14.87 25.7775 12.155 29.0625C11.555 29.7825 10.46 29.7825 9.86 29.0625C7.13 25.7775 0.5 17.1525 0.5 10.8975ZM7.25 10.8975C7.25 12.9675 8.93 14.6475 11 14.6475C13.07 14.6475 14.75 12.9675 14.75 10.8975C14.75 8.82746 13.07 7.14746 11 7.14746C8.93 7.14746 7.25 8.82746 7.25 10.8975Z';
  public mapOptions: google.maps.MapOptions = {
    zoom: 17,
    styles: [{featureType: 'poi', stylers: [{visibility: 'off'}]}]
  };

  constructor(private apiService: ApiService, public router: Router, private ngZone: NgZone) {
    this.mapCenter = this.UCBekerleyLatlng;
    this.getResourcesForSearching();
    this.search().subscribe((data) => {
      this.allPois = data;
      this.updatePlacesState();
    });
  }

  ngOnInit() {
    fromEvent(this.placeSearchInput.nativeElement, "keyup")
      .pipe(
        map((event: any) => {
          return this.keyword;
        }),
        filter((res) => res.length > 2),
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
    this.placeTypes = ['restaurants', 'groceries', 'coffee', 'pharmacies', 'gyms', 'parks'];
  }

  public onInputFocus() {
    ParentContainerState.fullscreen.next(true);
  }

  public onInputFocusOut() {
    if (!(this.keyword || this.placeType)) {
      ParentContainerState.fullscreen.next(false);
    }
  }

  private searchByKeyword() {
    this.search().subscribe((data) => this.updatePlacesState());
  }

  public searchByPlaceType(type: string) {
    ParentContainerState.fullscreen.next(true);
    this.placeType = type;
    this.search().subscribe((data) => this.updatePlacesState());
  }

  public search() {
    this.isSearching = true;
    let url = `${environment.autonomy_api_url}api/points-of-interest`;
    let params: string[] = [];

    // Fake the keywork for now to avoid API error, TODO: remove this later
    if (!this.keyword) {
      params.push(`text=Berkeley`);
    }

    if (this.keyword) {
      params.push(`text=${this.keyword}`);
    }
    if (this.placeType) {
      params.push(`place_type=${this.placeType}`);
    }
    if (params.length) {
      url += `?${params.join('&')}`;
    }

    return Observable.create(observer => {
      this.apiService
      .request('get', url, null, null, ApiService.DSTarget.CDS)
      .subscribe(
        (data) => {
          this.isSearching = false;
          this.filteredPois = FakePOIS;
          observer.next(this.filteredPois);
          observer.complete();
        },
        (err) => {
          this.isSearching = false;
          observer.error(err);
        }
      );
    });
  }

  public updatePlacesState() {
    if (this.focusedPlace) {
      this.focusedPlace.focused = true;
      this.focusedPlace.color = AppSettings.PLACE_FOCUSED_COLOR;
    }

    this.allPois.forEach((poi) => {
      let filteredOne = this.filteredPois.find(item => item.id === poi.id);
      poi.filtered = !!filteredOne;
      poi.color = Util.scoreToColor(poi.resource_score, !filteredOne);
    });
  }

  public focusToPlace(poi) {
    this.focusedPlace = poi;
    this.focusedPlace.focused = true;
    this.filteredPois = [];
    this.updatePlacesState();
  }

  public focusoutPlace(poi) {
    this.focusedPlace.focused = false;
    this.focusedPlace = null;
    this.updatePlacesState();
  }

  public clearAll() {
    if (this.keyword || this.placeType) {
      this.keyword = "";
      this.placeType = "";
      this.isSearching = false;
      this.filteredPois.splice(0, this.filteredPois.length);
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
}
