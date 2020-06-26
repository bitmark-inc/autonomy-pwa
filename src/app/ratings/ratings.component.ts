import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss']
})
export class RatingsComponent implements OnInit {

  public poiID: string;
  public highlightID: string;
  public ratings: {
    resource: {
      id: string,
      name: string,
    }
    score: number
  }[];

  constructor(private activatedRoute: ActivatedRoute, private location: Location, private apiService: ApiService, public router: Router) {
    this.activatedRoute.params.subscribe((params) => {
      this.poiID = params.id;
      this.getRatings();
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      this.highlightID = params['highlight_id'];
    });
  }

  ngOnInit() {}

  private getRatings(): void {
    this.apiService
      .request('get', `api/points-of-interest/${this.poiID}/resource-ratings`)
      .subscribe(
        (data: {ratings: any}) => {
          this.ratings = data.ratings;
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  public submitRatings(): void {
    this.apiService
      .request('put', `api/points-of-interest/${this.poiID}/resource-ratings`, {
        ratings: this.ratings
      })
      .subscribe(
        () => {
          this.router.navigate(["/pois", this.poiID]);
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  public back(): void {
    this.location.back();
  }

}
