declare var window: any;

import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HomepageState as ParentContainerState } from '../homepage.state';
import { debounceTime, map, distinctUntilChanged, expand } from 'rxjs/operators';
import { fromEvent, Observable, empty } from 'rxjs';
import { Util } from 'src/app/services/util/util.service';
import { GoogleMap } from '@angular/google-maps';

interface POI {
  id: string,
  alias: string,
  mapLabel: string,
  address: string,
  location: {
    latitude: number,
    longitude: number
  },
  rating_last_updated: number,
  opening_hours: {},
  place_types: string[],
  service_options: {},
  resource_score: number,
  focused: boolean,
  place_type: string,
  todayOpenHour: string,
  todayOpenHourForView: string,
  services_active: string,
  color: string,
  mapIconUrl: string
}

@Component({
  selector: "app-resources",
  templateUrl: "./resources.component.html",
  styleUrls: ["./resources.component.scss"],
})
export class ResourcesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("poiSearchInput", { static: true }) poiSearchInput: ElementRef;
  @ViewChild(GoogleMap) mapRef: GoogleMap;

  // Searching settings
  public keyword: string = "";

  public poiType: string;
  public poiTypes: string[];

  public focusedPOI: POI;
  private focusedPOIID: string;

  public isSearching: boolean = false;
  public focusState: boolean = false;
  public isResultListShown: boolean = false;
  public pois: POI[] = [];

  // Map settings
  private centerBekerleyLatlng: google.maps.LatLngLiteral = {
    lat: 37.865136,
    lng: -122.258432
  }
  public mapCenter: google.maps.LatLngLiteral;
  public mapIconSVGPath: string = 'M0.5 10.8975C0.5 5.09246 5.195 0.397461 11 0.397461C16.805 0.397461 21.5 5.09246 21.5 10.8975C21.5 17.1525 14.87 25.7775 12.155 29.0625C11.555 29.7825 10.46 29.7825 9.86 29.0625C7.13 25.7775 0.5 17.1525 0.5 10.8975ZM7.25 10.8975C7.25 12.9675 8.93 14.6475 11 14.6475C13.07 14.6475 14.75 12.9675 14.75 10.8975C14.75 8.82746 13.07 7.14746 11 7.14746C8.93 7.14746 7.25 8.82746 7.25 10.8975Z';
  public mapIconSize = new google.maps.Size(21,29)
  public mapIconSizeFocus = new google.maps.Size(25,35)
  public mapHeight: string;
  public mapWidth: string;
  public mapZoomLevel: number = 18;
  public mapOptions: google.maps.MapOptions = {
    zoom: this.mapZoomLevel,
    // maxZoom: 30,
    minZoom: 12,
    disableDefaultUI: true,
    styles: [{featureType: 'poi', stylers: [{visibility: 'off'}]}]
  };

  public labelPosition = new google.maps.Point(17,37);
  public labelShown: boolean = true;

  constructor(private apiService: ApiService, public router: Router, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.keyword = params['keyword'];
      this.poiType = params['poi_type'];
      this.focusedPOIID = params['focus_poi_id'];
    })
    this.mapCenter = this.centerBekerleyLatlng;
    this.mapHeight = `${window.innerHeight - 56 -60}px`;
    this.mapWidth = `${window.innerWidth > 768 ? 768 : window.innerWidth}px`;
    document.body.style.position = 'fixed';
    this.getResourcesForSearching();
    this.search(false);
  }

  ngOnInit() {
    fromEvent(this.poiSearchInput.nativeElement, "keyup")
      .pipe(
        map((event: any) => {
          this.isSearching = true;
          return this.keyword;
        }),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.searchByKeyword();
      });
  }

  ngAfterViewInit() {
    if (this.focusedPOIID) {
      this.isResultListShown = false;
    } else if (this.keyword || this.poiType) {
      this.isResultListShown = true;
    }
  }

  ngOnDestroy() {
    ParentContainerState.fullscreen.next(false);
    document.body.style.position = 'initial';
  }

  public trackByPoiID(index, item) {
    return item.id
  }

  private getResourcesForSearching() {
    this.poiTypes = ['restaurants', 'coffee', 'groceries', 'pharmacies'];
  }

  private placeTypeSingular(plural): string {
    let singular: string;
    switch (plural.toLowerCase()) {
      case 'restaurants':
        singular = 'Restaurant';
        break;
      case 'groceries':
        singular = 'Groceries';
        break;
      case 'pharmacies':
        singular = 'Pharmacy';
        break;
      default:
        singular = plural;
        break;
    }
    return singular;
  }

  private formatPOI(data: POI[]) {
    data.forEach(poi => {
      poi.mapLabel = (poi.alias && poi.alias.split(' ').length > 3) ? poi.alias.split(' ', 3).join(' ').concat('...') : poi.alias
      poi.place_type = poi.place_types.map(type => this.placeTypeSingular(type)).join(', ');

      if (poi.opening_hours && Object.keys(poi.opening_hours).length != 0) {
        let time = Util.openHoursFormat(poi.opening_hours, true);
        poi.todayOpenHour = time;
        poi.todayOpenHourForView = (!time || time === 'Closed') ? 'Closed today' : `Open ${time.toLowerCase()} today`;
      } else {
        poi.todayOpenHour = '';
        poi.todayOpenHourForView = '';
      }
      if (poi.service_options && Object.keys(poi.service_options).length != 0) {
        poi.services_active = Object.keys(poi.service_options).map(e => poi.service_options[e] ? e : '').filter(s => s != '').join(', ');
      } else {
        poi.services_active = '';
      }
    })
  }

  private fakeResourceScore(data: POI[]) {
    data.forEach(poi => {
      poi.resource_score = Math.floor(Math.random() * 5.0);
      poi.rating_last_updated = 1595402179094;
    })
  }

  private deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  private getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    let R = 6371; // Radius of the earth in km
    let dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    let dLon = this.deg2rad(lon2-lon1);
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in km
    return d;
  }

  public zoomHandle() {
    if (this.mapRef) {
      this.mapZoomLevel = this.mapRef.getZoom();
      this.labelShown = this.mapZoomLevel >= 18;
    }
  }

  public dragEndHandle() {
    if (this.mapRef) {
      let dragDistance = this.getDistanceFromLatLonInKm(
        this.mapCenter.lat,
        this.mapCenter.lng,
        this.mapRef.getBounds().getCenter().lat(),
        this.mapRef.getBounds().getCenter().lng()
      );
      if (dragDistance >= 3) {
        this.mapCenter = { lat: this.mapRef.getCenter().lat(), lng: this.mapRef.getCenter().lng() };
        this.search(false, false);
      }
    }
  }

  public onInputFocus() {
    ParentContainerState.fullscreen.next(true);
    this.isResultListShown = true;
    this.focusState = false;
  }

  public onInputFocusOut() {
    if (!this.keyword) {
      ParentContainerState.fullscreen.next(false);
    }
  }

  private searchByKeyword() {
    this.search();
  }

  public searchByPlaceType(type: string) {
    ParentContainerState.fullscreen.next(true);
    this.isResultListShown = true;
    this.focusState = false;
    this.poiType = type;
    this.search();
  }

  // search progress
  private getAllPOIs(): Observable<any[]> {
    let paginate: number = 0;
    const getRange = (page: number = 0): Observable<any> => {
      return this.searchOnRange(page);
    };
    return getRange().pipe(
      expand((data) => {
        if (data && data.length && data.length === 100) {
          paginate += 1;
          return getRange(paginate);
        } else {
          return empty();
        }
      }),
      map((data) => this.formatSearch(data))
    )
  }

  private searchOnRange(paginate: number = 0, limit: number = 100): Observable<any> {
    let url = `${environment.autonomy_api_url}api/points-of-interest`;

    // default params
    url += `?profile=berkeley&lat=${this.mapCenter.lat}&lng=${this.mapCenter.lng}&radius=5000&count=${limit}&page=${paginate}`;

    if (this.keyword) {
      url += `&text=${this.keyword}`;
    }
    else if (this.poiType) {
      url += `&place_type=${this.poiType}`;
    }

    return this.apiService.request('get', url, null, null, ApiService.DSTarget.CDS);
  }

  private formatSearch(data: POI[]): POI[] {
    if (data && data.length) {
      if (environment.bitmark_network === 'testnet') {
        this.fakeResourceScore(data);
      }
      this.formatPOI(data);
      this.updatePlaceColors(data);
    }
    return data;
  }

  private afterGetAllPOIs(moveCenter) {
    this.isSearching = false;

    // moveCenter condition to skip focus while user drag map
    if (moveCenter && this.focusedPOIID) {
      let focusPOI = this.pois.find(poi => poi.id === this.focusedPOIID);
      this.focusedPOIID = '';
      this.focusToPlace(focusPOI, true, false);
    }
  }

  public search(replaceUrl: boolean = true, moveCenter: boolean = true) {
    // skip search and clean pois if have no filter
    if (!this.keyword && !this.poiType) {
      this.pois.splice(0, this.pois.length);
      return;
    }

    this.isSearching = true;
    this.mapZoomLevel = 19;
    this.labelShown = true;

    if (replaceUrl) {
      this.router.navigate(["/home", "resources"], {
        queryParams: { keyword: this.keyword, poi_type: this.poiType },
        replaceUrl: true,
      });
    }

    let tmp = [];
    this.getAllPOIs().subscribe((data: POI[]) => {
      if (tmp.length) {
        this.pois.push(...data);
      } else {
        tmp = data;
        this.pois = tmp;
      }

      if (moveCenter && this.pois && this.pois.length) {
        this.mapRef.panTo({
          lat: this.pois[0].location.latitude,
          lng: this.pois[0].location.longitude,
        });
      }
    },
    (err) => {
      this.isSearching = false;
      window.alert(err.message);
    },
    () => {
      this.afterGetAllPOIs(moveCenter);
    });
  }
  // end search

  public updatePlaceColors(data: POI[]) {
    data.forEach((poi) => {
      poi.color = Util.scoreToColor(poi.resource_score, false);

      // update map icon
      let category = this.poiType ? this.poiType.toLowerCase() : (poi.place_types && poi.place_types.length ? poi.place_types[0].toLowerCase() : 'default');
      let scoreOrder = Util.scoreToColor(poi.resource_score, false, true);
      poi.mapIconUrl = `/assets/img/map-marker/${category}/rate_${scoreOrder}.svg`
    });
  }

  public focusToPlace(poi: POI, moveCenter: boolean = false, replaceUrl: boolean = true) {
    if (replaceUrl) {
      this.router.navigate(['/home', 'resources'], {
        queryParams: {keyword: this.keyword, poi_type: this.poiType, focus_poi_id: poi.id},
        replaceUrl: true
      });
    }
    this.focusState = true;
    this.focusedPOI = poi;
    this.focusedPOI.focused = true;
    this.mapZoomLevel = 20;
    this.labelShown = true;
    ParentContainerState.fullscreen.next(false);
    if (moveCenter) {
      this.mapRef.panTo({
        lat: this.focusedPOI.location.latitude,
        lng: this.focusedPOI.location.longitude,
      });
    }
    this.updatePlaceColors(this.pois);
  }

  public unfocusPlace(poi: POI) {
    this.router.navigate(['/home', 'resources'], {
      queryParams: {keyword: this.keyword, poi_type: this.poiType},
      replaceUrl: true
    });
    this.focusState = false;
    this.focusedPOI.focused = false;
    this.focusedPOI = null;
    if (this.pois && this.pois.length) {
      this.isResultListShown = true;
    }
    this.updatePlaceColors(this.pois);
  }

  public clearAll() {
    if (this.keyword || this.poiType) {
      this.keyword = "";
      this.poiType = "";
      if (this.pois && this.pois.length) {
        this.pois.splice(0, this.pois.length);
      }
      this.isResultListShown = false;
      this.isSearching = false;
      if (this.focusedPOI) {
        this.unfocusPlace(this.focusedPOI);
      }
      ParentContainerState.fullscreen.next(false);

      // replace Url
      this.router.navigate(['/home', 'resources'], {
        replaceUrl: true,
      });
    }
  }

  public pullListView() {
    this.isResultListShown = !this.isResultListShown;
    if (!this.isResultListShown) {
      ParentContainerState.fullscreen.next(false);
    }
  }

  public navigateToPOI(id: string) {
    this.router.navigate(['/home/resources/pois', id]);
  }

  public isStandalone(): boolean {
    return (window.matchMedia('(display-mode: standalone)').matches);
  }
}
