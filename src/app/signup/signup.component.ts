declare var window: any;

import { NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from '../bottom-sheet-alert/bottom-sheet-alert.component';

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
  public isIOSSafari: boolean;
  public pID: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private userService: UserService, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef, private http: HttpClient, private ngZone: NgZone) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.pID = params['pid'];
      console.log(this.pID);
      if (this.pID) {
        this.userService.saveParticipantID(this.pID);
      }
    });
    this.setStageByUrl(this.router.url.split('?')[0]);
    this.isIOSSafari = /(iPad|iPhone|iPod)/gi.test(navigator.userAgent) &&
      !/CriOS/.test(navigator.userAgent) &&
      !/FxiOS/.test(navigator.userAgent) &&
      !/OPiOS/.test(navigator.userAgent) &&
      !/mercury/.test(navigator.userAgent);
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

  public isValidPID(): boolean {
    return !!this.pID;
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

  private downloadFile() {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    this.http.get('/assets/files/UCB_Safe_Campus_Study_Informed_Consent.pdf', { headers: headers, responseType: 'arraybuffer' })
    .subscribe(
      (data: any) => {
      const aFile = new Blob([data], { type: 'application/pdf'});
      const url = window.URL.createObjectURL(aFile);
      let reader = new FileReader();
      let link = document.createElement('a');

      reader.onload = () => {
        link.href = url;
        link.target = '_blank';
        link.download = 'UCB_Safe_Campus_Study_Informed_Consent';
        link.click();
      }
      reader.readAsDataURL(aFile);
      },
      err => {},
      () => {
        if (this.isIOSSafari) {
          this.router.navigate(['/home/trends']);
        }
      }
    )
  }

  public isStandalone(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  public signup(): void {
    if (this.clickable) {
      this.clickable = false;
      console.log(this.isValidPID());
      if (this.isValidPID()) {
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
      } else {
        this.clickable = true;
        console.log('Your participant ID is incorrect.');
        this.router.navigate(['/404']);
      }
    }
  }

  public signupAndDownload(): void {
    if (this.clickable) {
      this.clickable = false;
      if (this.isValidPID()) {
        this.openBottomSheet();
        this.userService.signup().subscribe(
          (data) => {
            setTimeout(() => {
              this.bottomSheetRef.afterDismissed().subscribe(() => {
                this.clickable = true;
                this.ngZone.runOutsideAngular(() => {
                  this.downloadFile();
                });
                if (!this.isIOSSafari) {
                  this.router.navigate(['/home/trends'], { queryParams: { downloadIRB: true } });
                }
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
      } else {
        this.clickable = true;
        console.log('Your participant ID is incorrect.');
        this.router.navigate(['/404']);
      }
    }
  }
}
