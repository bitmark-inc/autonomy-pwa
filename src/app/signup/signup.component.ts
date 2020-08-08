declare var window: any;

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "../bottom-sheet-alert/bottom-sheet-alert.component";

enum EnumPageStage { Intro, Consent }

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit {
  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Intro;
  public clickable: boolean = true;

  constructor(private router: Router, private userService: UserService, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef) {
    this.setStageByUrl(this.router.url);
  }

  ngOnInit() {}

  private setStageByUrl(url: string = '') {
    switch (url) {
      case '/landing/p':
        this.stage = this.PageStage.Intro;
        break;
      case '/landing/p/irb':
        this.stage = this.PageStage.Consent;
        break;
      default:
        this.stage = this.PageStage.Intro;
        break;
    }
  }

  private openBottomSheet(): void {
    this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
      disableClose: true,
      data: {
        error: false,
        header: "CREATING",
        mainContent: "Creating your Autonomy account ...",
      },
    });
  }

  public isStandalone(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  public signup(): void {
    if (this.clickable) {
      this.clickable = false;
      this.openBottomSheet();
      this.userService.signup().subscribe(
        (data) => {
          setTimeout(() => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.clickable = true;
              this.router.navigate(['/home/trends']);
            });
            this.bottomSheetRef.dismiss();
          }, 3 * 1000);
        },
        (err) => {
          // TODO: do something
          this.clickable = true;
          console.log(err);
        }
      );
    }
  }

  public signupAndDownload(): void {
    if (this.clickable) {
      this.clickable = false;
      this.openBottomSheet();
      this.userService.signup().subscribe(
        (data) => {
          setTimeout(() => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.clickable = true;
              this.router.navigate(['/home/trends'], { queryParams: { downloadIRB: true } });
            });
            this.bottomSheetRef.dismiss();
          }, 2 * 1000);
        },
        (err) => {
          // TODO: do something
          this.clickable = true;
          console.log(err);
        }
      );
    }
  }
}
