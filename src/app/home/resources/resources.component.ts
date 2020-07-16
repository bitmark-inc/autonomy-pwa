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
import { fromEvent } from "rxjs";

@Component({
  selector: "app-resources",
  templateUrl: "./resources.component.html",
  styleUrls: ["./resources.component.scss"],
})
export class ResourcesComponent implements OnInit, OnDestroy {
  @ViewChild("placeSearchInput", { static: true }) placeSearchInput: ElementRef;

  public keyword: string = "";
  public placesByKeyword: {
    name: string;
    formatted_address: string;
    place_id: string;
  }[];

  public placeTypes: string[];
  public resourceSearching: string;
  public poisByType: {
    id: string;
    alias: string;
    address: string;
    resource_score: number;
    last_updated: number;
  }[];

  constructor(private apiService: ApiService, public router: Router, private ngZone: NgZone) {}

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

    this.getResourcesForSearching();
  }

  ngOnDestroy() {
    ParentContainerState.fullscreen.next(false);
  }

  private searchByKeyword() {
    this.apiService
      .request('get', `${environment.autonomy_api_url}api/points-of-interest?text=${this.keyword}`, null, null, ApiService.DSTarget.CDS)
      .subscribe(
        (data) => {
          this.poisByType = data;
        },
        (err) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  private getResourcesForSearching() {
    this.placeTypes = ['restaurents', 'groceries', 'coffee', 'pharmacies', 'gyms', 'parks'];
  }

  public onInputFocus() {
    ParentContainerState.fullscreen.next(true);
  }

  public onInputFocusOut() {
    if (!(this.keyword || this.resourceSearching)) {
      ParentContainerState.fullscreen.next(false);
    }
  }

  public searchByPlaceType(type: string) {
    ParentContainerState.fullscreen.next(true);
    this.resourceSearching = type;
    this.apiService
      .request('get', `${environment.autonomy_api_url}api/points-of-interest?place_type=${type}`, null, null, ApiService.DSTarget.CDS)
      .subscribe(
        (data) => {
          this.poisByType = data;
        },
        (err) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  public clearAll() {
    if (this.keyword || this.resourceSearching) {
      this.keyword = "";
      this.resourceSearching = "";
      ParentContainerState.fullscreen.next(false);
    }
  }

  public navigateToPlace(place: any) {
    this.apiService
      .request("post", "api/points-of-interest", {
        alias: place.name,
        address: place.formatted_address,
        location: {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        },
      })
      .subscribe(
        (data: { id: string }) => {
          this.ngZone.run(() => {
            this.navigateToPOI(data.id);
          });
        },
        (err) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  public navigateToPOI(id: string) {
    this.router.navigate(["/pois", id]);
  }
}
