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
    resource: {
      id: string;
      name: string;
    };
    score: number;
  }[];

  public poi: {
    id: string;
    alias: string;
    address: string;
    owned: boolean;
    rating: boolean;
    has_more_resources: boolean;
    neighbor: {
      confirm: number;
      confirm_delta: number;
      symptom: number;
      symptom_delta: number;
      behavior: number;
      behavior_delta: number;
      score: number;
      score_delta: number;
    };
    resources: {
      resource: {
        id: string;
        name: string;
      };
      score: number;
      ratings: number;
    }[];
    autonomy_score: number;
    autonomy_score_delta: number;
  };

  public poiScore: number = 0;

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
      .request("get", `api/points-of-interest/${this.poiID}/resource-ratings`)
      .subscribe(
        (data: { ratings: any }) => {
          this.ratings = data.ratings;
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  private getPOIProfile(): void {
    this.apiService.request("get", `api/autonomy_profile?poi_id=${this.poiID}`).subscribe(
      (data: any) => {
        this.poi = data;
        this.getPoiScore();
      },
      (err: any) => {
        console.log(err);
        // TODO: do something
      }
    );
  }

  private getPoiScore() {
    if (this.poi.resources.length) {
      let scoresTotal = 0;
      let ratingsTotal = 1;
      for (let i = 0; i < this.poi.resources.length; i++) {
        scoresTotal += this.poi.resources[i].score * this.poi.resources[i].ratings;
        ratingsTotal += this.poi.resources[i].ratings;
      }
      this.poiScore = scoresTotal / ratingsTotal;
    }
  }

  private openBottomSheet(): void {
    this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
      data: {
        error: false,
        header: "submitting",
        mainContent: "Anonymously submitting your ratings for this place ...",
      },
    });
  }

  public submitRatings(): void {
    this.openBottomSheet();
    this.apiService
      .request("put", `api/points-of-interest/${this.poiID}/resource-ratings`, {
        ratings: this.ratings,
      })
      .subscribe(
        () => {
          setTimeout(() => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.router.navigate(["/pois", this.poiID]);
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

  public back(): void {
    this.location.back();
  }
}
