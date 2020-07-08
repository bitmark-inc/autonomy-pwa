declare var window: any;

import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter
} from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: "app-poi-search",
  templateUrl: "./poi-search.component.html",
  styleUrls: ["./poi-search.component.scss"],
})
export class PoiSearchComponent implements OnInit {
  @ViewChild("placeSearchInput", { static: true }) placeSearchInput: ElementRef;

  public keyword: string = "";
  public placesByKeyword: {
    name: string;
    formatted_address: string;
    place_id: string;
  }[];

  public resources: {
    id: string;
    name: string;
  }[];
  public resourceID: string;
  public poisByResource: {
    id: string;
    alias: string;
    address: string;
    resource_score: number;
    distance: number;
  }[];

  private placeService: any;

  constructor(private activatedRoute: ActivatedRoute, private apiService: ApiService, private ref: ChangeDetectorRef, public router: Router, private ngZone: NgZone) {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.category) {
        this.resourceID = params.category;
        this.searchByResource(params.categoryID, params.category);
      }
      
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

    this.getResourcesForSearching();
    setTimeout(() => {
      this.placeSearchInput.nativeElement.focus();
    }, 200);
  }

  private searchByKeyword() {
    // TODO: search by keyword from Autonomy server
  }

  private getResourcesForSearching() {
    this.apiService.request("get", `api/resources?suggestion=true`).subscribe(
      (data: { resources: any }) => {
        this.resources = data.resources;
      },
      (err) => {
        console.log(err);
        // TODO: do something
      }
    );
  }

  public searchByResource(id, name) {
    this.resourceID = name;
    this.apiService
      .request("get", `api/points-of-interest?resource_id=${id}`)
      .subscribe(
        (data) => {
          this.poisByResource = data;
        },
        (err) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  public clearAll() {
    if (this.keyword || this.resourceID) {
      this.keyword = "";
      this.resourceID = "";
      setTimeout(() => {
        this.placeSearchInput.nativeElement.focus();
      }, 50);
    } else {
      this.router.navigate(['/home/resources']);
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
