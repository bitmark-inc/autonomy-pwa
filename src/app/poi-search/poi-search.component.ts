declare var window: any;

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter
} from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-poi-search',
  templateUrl: './poi-search.component.html',
  styleUrls: ['./poi-search.component.scss']
})
export class PoiSearchComponent implements OnInit {

  @ViewChild('placeSearchInput', { static: true }) placeSearchInput: ElementRef;
  public keyword: string = '';
  public placesByKeyword: {
    description: string,
    distance_meters: number,
    id: string,
    place_id: string,
    reference: string,
    structured_formatting: {
       main_text: string,
       secondary_text: string
    }
  }[];

  public resources: {
    id: string,
    name: string,
  }[];
  public resourceID: string;
  public poisByResource: {
    id: string,
    alias: string,
  }[];

  private GGkey: string = window.App.config.google_key;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  ngOnInit() {
    fromEvent(this.placeSearchInput.nativeElement, 'keyup').pipe(
      map((event: any) => {
        return this.keyword;
      }),
      filter(res => res.length > 2),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.searchByKeyword();
    });

    this.getResourcesForSearching();
  }

  private searchByKeyword(){
    this.http
      .get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${this.keyword}&key=${this.GGkey}`)
      .subscribe(
        (data: {predictions: any}) => {
          this.placesByKeyword = data.predictions;
          console.log(this.placesByKeyword);
        },
        (err) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  private searchByResource(){
    this.apiService
      .request('get', `api/points-of-interest?resource_id=${this.resourceID}`)
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

  private getResourcesForSearching() {
    this.apiService
      .request('get', `api/resources?suggestion=true`)
      .subscribe(
        (data: {resources: any}) => {
          this.resources = data.resources;
        },
        (err) => {
          console.log(err);
          // TODO: do something
        }
      );
  }
}
