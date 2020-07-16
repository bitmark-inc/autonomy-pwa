import { environment } from '../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api/api.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "../bottom-sheet-alert/bottom-sheet-alert.component";

@Component({
  selector: "app-ratings",
  templateUrl: "./ratings.component.html",
  styleUrls: ["./ratings.component.scss"],
})
export class RatingsComponent implements OnInit {
  public poiID: string;
  public highlightID: string;
  public ratings: {
    name: string;
    score: number;
  }[] = [];
  public ratingsParam: {} = {};

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

  public submitable: boolean = true;

  constructor(private activatedRoute: ActivatedRoute, private location: Location, private apiService: ApiService, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef<BottomSheetAlertComponent>, public router: Router
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.poiID = params.id;
      this.getRatings();
      this.getPOIProfile();
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      this.highlightID = params["highlight_id"];
    });
  }

  ngOnInit() {}

  private getRatings(): void {
    this.apiService
      .request('get', `${environment.autonomy_api_url}api/points-of-interest/${this.poiID}/ratings`, null, null, ApiService.DSTarget.PDS)
      .subscribe(
        (data: { ratings: any }) => {
          for (let key in data.ratings) {
            this.ratings.push({
              name: key.replace(/_/g, ' '),
              score: data.ratings[key]
            });
          }
          this.checkSubmitable();
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  private getPOIProfile(): void {
    this.apiService.request('get', `${environment.autonomy_api_url}api/points-of-interest/${this.poiID}`, null, null, ApiService.DSTarget.CDS).subscribe(
      (data: any) => {
        this.poi = data;
      },
      (err: any) => {
        console.log(err);
        // TODO: do something
      }
    );
  }

  private openBottomSheet(): void {
    this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
      disableClose: true,
      data: {
        error: false,
        header: "submitting",
        mainContent: "Anonymously submitting your ratings for this place ...",
      },
    });
  }

  private checkSubmitable() {
    this.submitable = this.ratings.some(rating => {
      rating.score > 0;
    })
  }

  private formatParams() {
    this.ratings.forEach((el) => {
      let tmp = {};
      tmp[el.name.replace(/ /g, '_')] = el.score;
      this.ratingsParam = Object.assign(this.ratingsParam, tmp)
    })
  }

  public submitRatings(): void {
    if (this.submitable) {
      this.openBottomSheet();
      this.formatParams();
      this.apiService
        .request('put', `${environment.autonomy_api_url}api/points-of-interest/${this.poiID}/ratings`, {
          ratings: this.ratingsParam,
        }, null, ApiService.DSTarget.BOTH)
        .subscribe(
          () => {
            setTimeout(() => {
              this.bottomSheetRef.afterDismissed().subscribe(() => {
                this.router.navigate(['/pois', this.poiID]);
              })
              this.bottomSheetRef.dismiss();
            }, 3 * 1000);
          },
          (err: any) => {
            console.log(err);
            // TODO: do something
          }
        );
    }
  }

  public back(): void {
    this.location.back();
  }
}
